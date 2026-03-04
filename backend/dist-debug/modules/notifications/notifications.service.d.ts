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
export declare class NotificationsService {
    private notificationRepo;
    private userRepo;
    private gateway;
    constructor(notificationRepo: Repository<Notification>, userRepo: Repository<User>, gateway: NotificationsGateway);
    create(dto: CreateNotificationDto): Promise<Notification>;
    broadcast(dto: Omit<CreateNotificationDto, 'userId'>): Promise<void>;
    findAllForUser(userId: string): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }>;
    markRead(id: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    delete(id: string, userId: string): Promise<void>;
}
