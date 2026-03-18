import { Controller, Get, Patch, Delete, Post, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly pushService: PushService,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@CurrentUser() user: User) {
        try {
            if (!user || !user.id) {
                console.error('[NotificationsController] No user found in request');
                throw new Error('User not found in request context');
            }
            const result = await this.notificationsService.findAllForUser(user.id);
            // Ensuring we don't have circular references by being explicit
            return {
                notifications: result.notifications.map(n => ({
                    id: n.id,
                    title: n.title,
                    message: n.message,
                    type: n.type,
                    data: n.data,
                    isRead: n.isRead,
                    readAt: n.readAt,
                    createdAt: n.createdAt
                })),
                total: result.total,
                unreadCount: result.unreadCount
            };
        } catch (error) {
            console.error(`[NotificationsController] Error finding notifications for user ${user?.id}:`, error);
            throw error;
        }
    }

    @Patch(':id/read')
    @UseGuards(JwtAuthGuard)
    markRead(@Param('id') id: string, @CurrentUser() user: User) {
        return this.notificationsService.markRead(id, user.id);
    }

    @Patch('read-all')
    @UseGuards(JwtAuthGuard)
    markAllRead(@CurrentUser() user: User) {
        return this.notificationsService.markAllRead(user.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    delete(@Param('id') id: string, @CurrentUser() user: User) {
        return this.notificationsService.delete(id, user.id);
    }

    /** Returns the VAPID public key needed by the browser to subscribe */
    @Get('vapid-public-key')
    @Public()
    getVapidPublicKey() {
        return { publicKey: this.pushService.getPublicKey() };
    }

    /** Save a Web Push subscription for the current user */
    @Post('push-subscribe')
    @UseGuards(JwtAuthGuard)
    async subscribePush(@CurrentUser() user: User, @Body() subscription: any) {
        await this.notificationsService.savePushSubscription(user.id, subscription);
        return { success: true, message: 'Push subscription saved' };
    }

    /** Remove a Web Push subscription for the current user */
    @Delete('push-unsubscribe')
    @UseGuards(JwtAuthGuard)
    async unsubscribePush(@CurrentUser() user: User, @Body() body: { endpoint: string }) {
        await this.notificationsService.removePushSubscription(user.id, body.endpoint);
        return { success: true, message: 'Push subscription removed' };
    }
}
