import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationPriority } from '../../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { User } from '../../entities/user.entity';
import { PushService } from './push.service';

export enum NotificationType {
    // Vendor specific
    INQUIRY_RECEIVED = 'inquiry_received',
    INQUIRY_REPLIED = 'inquiry_replied',
    LEAD_RECEIVED = 'lead_received',
    CHAT_MESSAGE = 'chat_message',
    REVIEW_RECEIVED = 'review_received',
    REVIEW_REPLIED = 'review_replied',
    NEGATIVE_REVIEW_ALERT = 'negative_review_alert',
    SUBSCRIPTION_ALERT = 'subscription_alert',
    DEMAND_ALERT = 'demand_alert',
    
    // User specific
    OFFER_NEW = 'offer_new',
    NEARBY_ALERT = 'nearby_alert',
    REVIEW_LIKE = 'review_like',
    BROADCAST_RESPONSE = 'broadcast_response',

    // Admin specific
    FRAUD_ALERT = 'fraud_alert',
    SYSTEM_SPIKE = 'system_spike',
    PAYMENT_FAILURE = 'payment_failure',
    
    // Generic
    SYSTEM_UPDATE = 'system_update',
    INFO = 'info',
}

export interface CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    data?: Record<string, any>;
    link?: string;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private gateway: NotificationsGateway,
        @Inject(forwardRef(() => PushService))
        private pushService: PushService,
    ) {
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'permanent_error_log.txt');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] NotificationsService Constructor Called\n`);
        } catch (e) {}
    }

    /** Create and persist a notification, then push via WebSocket */
    async create(dto: CreateNotificationDto): Promise<Notification> {
        const user = await this.userRepo.findOne({
            where: { id: dto.userId },
            select: ['id', 'notificationSettings'],
        });

        const settings = user?.notificationSettings || {};
        const inAppEnabled = this.isChannelEnabled(dto.type, 'inApp', settings);
        const pushEnabled = this.isChannelEnabled(dto.type, 'push', settings);

        const notification = this.notificationRepo.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            type: dto.type,
            priority: dto.priority || NotificationPriority.MEDIUM,
            link: dto.link,
            data: dto.data || {},
        });
        const saved = await this.notificationRepo.save(notification);

        if (inAppEnabled) {
            const payload = {
                id: saved.id,
                title: saved.title,
                message: saved.message,
                type: saved.type,
                priority: saved.priority,
                link: saved.link,
                data: saved.data,
                isRead: false,
                createdAt: saved.createdAt,
            };

            // Push real-time via WebSocket
            this.gateway.sendToUser(dto.userId, 'notification', payload);
        }

        if (pushEnabled) {
            // Push via Web Push / FCM
            this.pushService.sendToUser(dto.userId, {
                title: saved.title,
                message: saved.message,
                type: saved.type,
                url: dto.link || '/notifications',
            }).catch(() => { /* non-critical */ });
        }

        return saved;
    }

    private isChannelEnabled(type: NotificationType, channel: 'inApp' | 'push' | 'email', settings: any): boolean {
        const channelSettings = settings[channel];
        if (!channelSettings) return true;

        // Map notification type to setting key
        const typeToKeyMap: Record<string, string> = {
            [NotificationType.INQUIRY_RECEIVED]: 'inquiry',
            [NotificationType.INQUIRY_REPLIED]: 'inquiry',
            [NotificationType.LEAD_RECEIVED]: 'lead',
            [NotificationType.CHAT_MESSAGE]: 'message',
            [NotificationType.REVIEW_RECEIVED]: 'review',
            [NotificationType.REVIEW_REPLIED]: 'review',
            [NotificationType.OFFER_NEW]: 'offers',
            [NotificationType.SYSTEM_UPDATE]: 'system',
            [NotificationType.FRAUD_ALERT]: 'system',
        };

        const key = typeToKeyMap[type] || 'system';
        return channelSettings[key] !== false;
    }

    /** Broadcast a notification to ALL regular users and vendors (role = user/vendor) */
    async broadcast(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
        const users = await this.userRepo.find({
            select: ['id'],
            where: { role: In(['user', 'vendor'] as any) },
        });
        for (const user of users) {
             this.create({ ...dto, userId: user.id }).catch(() => {});
        }
    }

    /** Send notification to all Admins */
    async notifyAdmin(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
        const admins = await this.userRepo.find({
            select: ['id'],
            where: { role: 'admin' as any },
        });
        for (const admin of admins) {
            this.create({ ...dto, userId: admin.id }).catch(() => {});
        }
    }

    /** Send notification to all Super Admins */
    async notifySuperAdmin(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
        const supers = await this.userRepo.find({
            select: ['id'],
            where: { role: 'superadmin' as any },
        });
        for (const sa of supers) {
            this.create({ ...dto, userId: sa.id }).catch(() => {});
        }
    }
    
    /** Send notification to all Vendors */
    async notifyAllVendors(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
        const vendors = await this.userRepo.find({
            select: ['id'],
            where: { role: 'vendor' as any },
        });
        for (const v of vendors) {
            this.create({ ...dto, userId: v.id }).catch(() => {});
        }
    }

    /** Get all notifications for a user, newest first */
    async findAllForUser(userId: string) {
        try {
            const [notifications, total] = await this.notificationRepo.findAndCount({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: 50,
            });
            const unreadCount = notifications.filter(n => !n.isRead).length;
            return { notifications, total, unreadCount };
        } catch (error) {
            // Log the error but return empty data to prevent 500 crashes during network instability
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'permanent_error_log.txt');
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] findAllForUser FALLBACK for user ${userId}: ${error.message}\n`);
            } catch (e) {}
            
            this.logger.error(`Database connection error in findAllForUser: ${error.message}`);
            return { notifications: [], total: 0, unreadCount: 0 };
        }
    }

    /** Mark a single notification as read */
    async markRead(id: string, userId: string): Promise<void> {
        await this.notificationRepo.update(
            { id, userId },
            { isRead: true, readAt: new Date() },
        );
    }

    /** Mark all notifications as read for a user */
    async markAllRead(userId: string): Promise<void> {
        await this.notificationRepo.update(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() },
        );
    }

    /** Delete a single notification */
    async delete(id: string, userId: string): Promise<void> {
        await this.notificationRepo.delete({ id, userId });
    }

    /** Save a push subscription for a user */
    async savePushSubscription(userId: string, subscription: any): Promise<void> {
        await this.pushService.saveSubscription(userId, subscription);
    }

    /** Remove a push subscription for a user */
    async removePushSubscription(userId: string, endpoint: string): Promise<void> {
        await this.pushService.removeSubscription(userId, endpoint);
    }
}
