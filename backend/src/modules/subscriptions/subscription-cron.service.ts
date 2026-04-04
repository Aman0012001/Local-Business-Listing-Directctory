import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { ActivePlan, ActivePlanStatus } from '../../entities/active-plan.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PushService } from '../notifications/push.service';
import { Listing } from '../../entities/business.entity';
import { PricingPlanType } from '../../entities/pricing-plan.entity';
import { OfferEvent, OfferStatus } from '../../entities/offer-event.entity';
import { OffersService } from '../offers/offers.service';
import { PromotionsService } from '../promotions/promotions.service';

@Injectable()
export class SubscriptionCronService {
    private readonly logger = new Logger(SubscriptionCronService.name);

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepo: Repository<Subscription>,
        @InjectRepository(ActivePlan)
        private activePlanRepo: Repository<ActivePlan>,
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Listing)
        private listingRepo: Repository<Listing>,
        @InjectRepository(OfferEvent)
        private offerEventRepo: Repository<OfferEvent>,
        private offersService: OffersService,
        private promotionsService: PromotionsService,
        private notificationsService: NotificationsService,
        private pushService: PushService,
    ) { }

    /**
     * Runs every day at 8 AM - checks for subscriptions expiring in 1-4 days
     * Sends in-app notification + push notification to each vendor
     */
    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async handleExpiryReminders() {
        try {
            this.logger.log('[Cron] Running subscription expiry check...');
            await this.sendExpiryReminders();
        } catch (error) {
            this.logger.error(`[Cron] Failed to send expiry reminders: ${error.message}`);
        }
    }

    /**
     * Runs every hour - deactivates expired plans and clears listing flags
     */
    @Cron(CronExpression.EVERY_HOUR)
    async handlePlanExpirations() {
        try {
            this.logger.log('[Cron] Checking for expired plans...');
            const now = new Date();

            const allExpired = await this.activePlanRepo.find({
                where: {
                    status: ActivePlanStatus.ACTIVE,
                    endDate: LessThanOrEqual(now),
                },
                relations: ['plan'],
            });

            // SKIP expiration for plans with price 0 (Basic/Free plans are perpetual)
            const expiredPlans = allExpired.filter(p => Number(p.plan?.price || 0) > 0);

            if (expiredPlans.length === 0) return;

            for (const plan of expiredPlans) {
                try {
                    // 1. Mark as expired
                    plan.status = ActivePlanStatus.EXPIRED;
                    await this.activePlanRepo.save(plan);

                    // 2. Clear listing flags if it was a boost
                    if (plan.targetId) {
                        const planType = (plan.plan as any)?.type;
                        if (planType === PricingPlanType.HOMEPAGE_FEATURED || planType === PricingPlanType.CATEGORY_FEATURED) {
                            await this.listingRepo.update(plan.targetId, { isFeatured: false });
                        } else if (planType === PricingPlanType.LISTING_BOOST) {
                            await this.listingRepo.update(plan.targetId, { isSponsored: false });
                        }
                    }

                    // 3. Deletion of promotions is now handled by offersService and promotionsService respectively in steps 4 and 5 below.

                    this.logger.log(`[Cron] Deactivated expired plan ${plan.id} for vendor ${plan.vendorId}`);
                } catch (err: any) {
                    this.logger.error(`[Cron] Error handling plan ${plan.id} expiry: ${err.message}`);
                }
            }

            // 4. Also run the general cleanup for non-boosted items (free ones) that have expired
            try {
                const staleAffected = await this.offersService.expireStaleOffers();
                if (staleAffected > 0) {
                    this.logger.log(`[Cron] Cleaned up ${staleAffected} stale/un-featured items from database`);
                }
            } catch (err: any) {
                this.logger.error(`[Cron] Error cleaning up stale offers: ${err.message}`);
            }

            // 5. Run promotion bookings expiration
            try {
                const promoAffected = await this.promotionsService.handleExpirations();
                if (promoAffected > 0) {
                    this.logger.log(`[Cron] Expired ${promoAffected} custom promotion bookings`);
                }
            } catch (err: any) {
                this.logger.error(`[Cron] Error cleaning up expired promotion bookings: ${err.message}`);
            }
        } catch (error) {
            this.logger.error(`[Cron] Failed to process plan expirations: ${error.message}`);
        }
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

        // Find active old-style subscriptions ending within the next 1-4 days
        const expiringOld = await this.subscriptionRepo.find({
            where: {
                status: SubscriptionStatus.ACTIVE,
                endDate: LessThanOrEqual(in4Days),
            },
            relations: ['plan', 'vendor', 'vendor.user'],
        });

        // Find active new-style plans ending within the next 1-4 days
        const expiringNew = await this.activePlanRepo.find({
            where: {
                status: ActivePlanStatus.ACTIVE,
                endDate: LessThanOrEqual(in4Days),
            },
            relations: ['plan', 'vendor', 'vendor.user'],
        });

        const allExpiring = [...expiringOld, ...expiringNew];

        let notified = 0;
        let errors = 0;

        for (const sub of allExpiring) {
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
