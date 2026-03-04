import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { User } from '../../entities/user.entity';

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
    constructor(
        @InjectRepository(Notification)
        private notificationRepo: Repository<Notification>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private gateway: NotificationsGateway,
    ) { }

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

        // Push real-time to user if connected
        this.gateway.sendToUser(dto.userId, 'notification', {
            id: saved.id,
            title: saved.title,
            message: saved.message,
            type: saved.type,
            data: saved.data,
            isRead: false,
            createdAt: saved.createdAt,
        });

        return saved;
    }

    /** Broadcast a notification to ALL regular users (role = user) */
    async broadcast(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void> {
        const users = await this.userRepo.find({
            select: ['id'],
            where: { role: 'user' as any },
        });
        for (const user of users) {
            await this.create({ ...dto, userId: user.id });
        }
    }

    /** Get all notifications for a user, newest first */
    async findAllForUser(userId: string) {
        const [notifications, total] = await this.notificationRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        const unreadCount = notifications.filter(n => !n.isRead).length;
        return { notifications, total, unreadCount };
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
}
