import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { User } from '../../entities/user.entity';
import { PushService } from './push.service';

export interface CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type?: string;
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
        const notification = this.notificationRepo.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            type: dto.type || 'info',
            data: dto.data || {},
        });
        const saved = await this.notificationRepo.save(notification);

        const payload = {
            id: saved.id,
            title: saved.title,
            message: saved.message,
            type: saved.type,
            data: saved.data,
            isRead: false,
            createdAt: saved.createdAt,
        };

        // Push real-time via WebSocket (if tab is open)
        this.gateway.sendToUser(dto.userId, 'notification', payload);

        // Push via Web Push API (OS-level, works even when tab is closed)
        this.pushService.sendToUser(dto.userId, {
            title: saved.title,
            message: saved.message,
            type: saved.type,
            url: dto.link || '/vendor/notifications',
        }).catch(() => { /* non-critical */ });

        return saved;
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
