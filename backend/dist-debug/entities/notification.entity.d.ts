import { User } from './user.entity';
export declare class Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    data: Record<string, any>;
    isRead: boolean;
    readAt: Date;
    createdAt: Date;
    user: User;
}
