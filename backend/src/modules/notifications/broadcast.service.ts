import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, ILike } from 'typeorm';
import { Listing, Category, Vendor, User, SearchLog, NotificationLog } from '../../entities';
import { NotificationsService } from './notifications.service';

@Injectable()
export class BroadcastService {
    private readonly logger = new Logger(BroadcastService.name);

    constructor(
        @InjectRepository(SearchLog)
        private searchLogRepo: Repository<SearchLog>,
        @InjectRepository(NotificationLog)
        private notificationLogRepo: Repository<NotificationLog>,
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>,
        @InjectRepository(Listing)
        private listingRepo: Repository<Listing>,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Handle a search event: log it and broadcast to relevant vendors
     */
    async handleSearch(keyword: string, userId?: string, city?: string, latitude?: number, longitude?: number) {
        if (!keyword || keyword.trim().length < 2) return;

        const sanitizedKeyword = keyword.trim().toLowerCase();
        const normalizedKeyword = sanitizedKeyword.replace(/[^a-z0-9]/g, '');

        // 1. Log the search
        await this.searchLogRepo.save({
            keyword: sanitizedKeyword,
            normalizedKeyword,
            userId,
            city,
            latitude,
            longitude,
        });

        // 2. Find matching categories
        const categories = await this.categoryRepo.find({
            where: [
                { name: ILike(`%${sanitizedKeyword}%`) },
                { slug: sanitizedKeyword }
            ]
        });

        if (categories.length === 0) return;

        const categoryIds = categories.map(c => c.id);

        // 3. Find unique vendors with approved listings in these categories
        const approvedBusinesses = await this.listingRepo.find({
            where: categoryIds.map(catId => ({
                categoryId: catId,
                status: 'approved' as any,
                ...(city ? { city: ILike(`%${city}%`) } : {})
            })),
            relations: ['vendor', 'vendor.user'],
        });

        const vendorsToNotify = new Map<string, Vendor>();
        approvedBusinesses.forEach(b => {
            if (b.vendor && b.vendor.userId && b.vendor.userId !== userId) {
                vendorsToNotify.set(b.vendor.id, b.vendor);
            }
        });

        if (vendorsToNotify.size === 0) return;

        // 4. Broadcast with rate limiting
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        for (const [vendorId, vendor] of vendorsToNotify) {
            // Check rate limit: Has this vendor been notified for this keyword in the last 30 mins?
            const recentNotification = await this.notificationLogRepo.findOne({
                where: {
                    vendorId,
                    keyword: sanitizedKeyword,
                    sentAt: MoreThan(thirtyMinutesAgo)
                }
            });

            if (recentNotification) {
                this.logger.debug(`Rate limit: Skipping notification for vendor ${vendorId} and keyword "${sanitizedKeyword}"`);
                continue;
            }

            // 5. Dispatch notification
            try {
                await this.sendBroadcastNotification(vendor, sanitizedKeyword);

                // 6. Log the notification
                await this.notificationLogRepo.save({
                    vendorId,
                    keyword: sanitizedKeyword,
                    status: 'sent'
                });
            } catch (error) {
                this.logger.error(`Failed to send broadcast to vendor ${vendorId}: ${error.message}`);
                await this.notificationLogRepo.save({
                    vendorId,
                    keyword: sanitizedKeyword,
                    status: 'failed'
                });
            }
        }
    }

    private async sendBroadcastNotification(vendor: Vendor, keyword: string) {
        const title = 'Customer Searching for Your Service';
        const message = `A user searched for "${keyword}". Your business may appear in search results. Check your leads for updates.`;

        // Channel 1: In-App & WebSocket
        await this.notificationsService.create({
            userId: vendor.userId,
            title,
            message,
            type: 'search_alert',
            data: { keyword }
        });

        // Channel 2: Push Notification (Mock FCM)
        if (vendor.user?.deviceToken) {
            this.logger.log(`[PUSH] Sending FCM to token ${vendor.user.deviceToken}: ${title}`);
            // In a real app: await this.fcmService.send(vendor.user.deviceToken, { title, body: message });
        }

        // Channel 3: Email Notification (Mock)
        if (vendor.businessEmail || vendor.user?.email) {
            const email = vendor.businessEmail || vendor.user?.email;
            this.logger.log(`[EMAIL] Sending broadcast alert to ${email}: ${title}`);
            // In a real app: await this.mailService.send(email, title, message);
        }
    }
}
