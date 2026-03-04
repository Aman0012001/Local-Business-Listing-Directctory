import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(req: any): Promise<{
        notifications: import("../../entities").Notification[];
        total: number;
        unreadCount: number;
    }>;
    markRead(id: string, req: any): Promise<void>;
    markAllRead(req: any): Promise<void>;
    delete(id: string, req: any): Promise<void>;
}
