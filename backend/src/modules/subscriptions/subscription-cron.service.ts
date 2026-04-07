import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PushService } from '../notifications/push.service';

@Injectable()
export class SubscriptionCronService {
    private readonly logger = new Logger(SubscriptionCronService.name);

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepo: Repository<Subscription>,
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private notificationsService: NotificationsService,
        private pushService: PushService,
    ) { }

    /**
     * Runs every day at 8 AM - checks for subscriptions expiring in 1-4 days
     * Sends in-app notification + push notification to each vendor
     */
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handleExpiryReminders() {
        this.logger.log('[Cron] Running subscription expiry check...');
        await this.sendExpiryReminders();
    }

    /**
     * Core logic - callable from cron or manually via admin trigger endpoint
     */
    async sendExpiryReminders(): Promise<{ notified: number; errors: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const in4Days = new Date(today);
        in4Days.setDate(in4Days.getDate() + 4);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Find active subscriptions ending within the next 1-4 days
        const expiring = await this.subscriptionRepo.find({
            where: {
                status: SubscriptionStatus.ACTIVE,
                endDate: LessThanOrEqual(in4Days),
            },
            relations: ['plan', 'vendor', 'vendor.user'],
        });

        let notified = 0;
        let errors = 0;

        for (const sub of expiring) {
            try {
                if (!sub.vendor?.user) continue;

                const user = sub.vendor.user;
                const endDate = new Date(sub.endDate);
                const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                if (daysLeft < 0) continue; // Already expired, skip

                const planName = sub.plan?.name || 'your plan';
                const title = `⚠️ Subscription Expiring ${daysLeft <= 1 ? 'Tomorrow' : `in ${daysLeft} Days`}`;
                const message = `Your ${planName} subscription expires on ${endDate.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}. Renew now to keep your listings active.`;

                // 1. In-app notification
                await this.notificationsService.create({
                    userId: user.id,
                    title,
                    message,
                    type: 'subscription_expiry',
                    link: '/vendor/subscription',
                    data: {
                        subscriptionId: sub.id,
                        daysLeft,
                        planName,
                        endDate: endDate.toISOString(),
                    },
                });

                // 2. Push notification (via PushService directly for OS-level)
                await this.pushService.sendToUser(user.id, {
                    title,
                    message,
                    type: 'subscription_expiry',
                    url: '/vendor/subscription',
                });

                this.logger.log(`[Cron] Expiry reminder sent to user ${user.id} (${user.email}) - ${daysLeft} day(s) left`);
                notified++;
            } catch (err: any) {
                this.logger.error(`[Cron] Failed to notify vendor ${sub.vendorId}: ${err.message}`);
                errors++;
            }
        }

        this.logger.log(`[Cron] Expiry check complete. Notified: ${notified}, Errors: ${errors}`);
        return { notified, errors };
    }
}
