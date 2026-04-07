import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { SearchLog } from '../../entities/search-log.entity';
import { NotificationLog } from '../../entities/notification-log.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { NotificationsService } from '../notifications/notifications.service';

export interface DemandInsight {
    keyword: string;
    normalizedKeyword: string;
    score: number;
    count1h: number;
    count6h: number;
    count24h: number;
    isTrending: boolean;
    growth: number;
}

@Injectable()
export class DemandService {
    private readonly logger = new Logger(DemandService.name);

    constructor(
        @InjectRepository(SearchLog)
        private searchLogRepository: Repository<SearchLog>,
        @InjectRepository(NotificationLog)
        private notificationLogRepo: Repository<NotificationLog>,
        @InjectRepository(Listing)
        private listingRepo: Repository<Listing>,
        private notificationsService: NotificationsService,
    ) { }

    async logSearch(data: {
        keyword: string;
        city?: string;
        categorySlug?: string;
        latitude?: number;
        longitude?: number;
        userId?: string;
        userAgent?: string;
        ipAddress?: string;
    }) {
        const log = this.searchLogRepository.create({
            ...data,
            normalizedKeyword: data.keyword?.toLowerCase().trim() || 'all',
        });
        return this.searchLogRepository.save(log);
    }

    /**
     * Calculate global or location-based demand insights
     */
    async getInsights(city?: string): Promise<DemandInsight[]> {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const prevWindowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);

        // Fetch logs for the last 24 hours
        const query = this.searchLogRepository.createQueryBuilder('log')
            .select('log.normalizedKeyword', 'normalizedKeyword')
            .addSelect('MAX(log.keyword)', 'keyword')
            .addSelect(`COUNT(CASE WHEN "log"."searched_at" >= :oneHour THEN 1 END)`, 'count1h')
            .addSelect(`COUNT(CASE WHEN "log"."searched_at" >= :sixHours THEN 1 END)`, 'count6h')
            .addSelect(`COUNT(CASE WHEN "log"."searched_at" >= :twentyFourHours THEN 1 END)`, 'count24h')
            .addSelect(`COUNT(CASE WHEN "log"."searched_at" >= :prevStart AND "log"."searched_at" < :oneHour THEN 1 END)`, 'countPrevHour')
            .setParameters({
                oneHour: oneHourAgo,
                sixHours: sixHoursAgo,
                twentyFourHours: twentyFourHoursAgo,
                prevStart: prevWindowStart
            });

        if (city) {
            query.andWhere('LOWER(log.city) = LOWER(:city)', { city });
        }

        const stats = await query.groupBy('log.normalizedKeyword').getRawMany();

        return stats.map(res => {
            const c1h = parseInt(res.count1h) || 0;
            const c6h = parseInt(res.count6h) || 0;
            const c24h = parseInt(res.count24h) || 0;
            const cPrev = parseInt(res.countPrevHour) || 0;

            // Score = (1h * 3) + (6h * 2) + (24h)
            const score = (c1h * 3) + (c6h * 2) + c24h;

            // Growth calculation (compare last hour vs previous hour)
            const growth = cPrev === 0 ? (c1h > 0 ? 100 : 0) : Math.round(((c1h - cPrev) / cPrev) * 100);
            const isTrending = growth >= 50 && c1h >= 3;

            return {
                keyword: res.keyword,
                normalizedKeyword: res.normalizedKeyword,
                score,
                count1h: c1h,
                count6h: c6h,
                count24h: c24h,
                isTrending,
                growth
            };
        }).sort((a, b) => b.score - a.score).slice(0, 10);
    }

    async getNearbyDemand(lat?: number, lng?: number) {
        // Simplified version for now, could use lat/lng radius in the future
        return this.getInsights();
    }

    async getHeatmap(keyword?: string) {
        const qb = this.searchLogRepository.createQueryBuilder('log')
            .select('log.latitude', 'lat')
            .addSelect('log.longitude', 'lng')
            .addSelect('COUNT(*)', 'intensity')
            .addSelect('MAX(log.city)', 'city')
            .addSelect('MAX(log.keyword)', 'keyword')
            .where('log.latitude IS NOT NULL AND log.longitude IS NOT NULL')
            .limit(1000); // Increased limit for better heatmap visuals

        if (keyword) {
            qb.andWhere('log.normalizedKeyword LIKE :keyword', { keyword: `%${keyword.toLowerCase()}%` });
        }

        return qb.groupBy('log.latitude').addGroupBy('log.longitude').getRawMany();
    }

    /**
     * Run periodic demand check and notify vendors
     */
    async processDemandAlerts() {
        this.logger.log('Running scheduled demand alert analysis...');
        const insights = await this.getInsights();
        const trendingInsights = insights.filter(i => i.isTrending);

        for (const insight of trendingInsights) {
            await this.notifyVendorsAboutHotDemand(insight);
        }
    }

    private async notifyVendorsAboutHotDemand(insight: DemandInsight) {
        // Find vendors in categories matching this keyword
        const businesses = await this.listingRepo.createQueryBuilder('listing')
            .leftJoinAndSelect('listing.vendor', 'vendor')
            .leftJoinAndSelect('listing.category', 'category')
            .where('listing.status = :status', { status: 'approved' })
            .andWhere('(category.name ILIKE :kw OR category.slug = :normalized)', {
                kw: `%${insight.keyword}%`,
                normalized: insight.normalizedKeyword
            })
            .getMany();

        const vendorIds = new Set<string>();
        for (const business of businesses) {
            if (business.vendor?.userId) {
                if (vendorIds.has(business.vendor.id)) continue;
                vendorIds.add(business.vendor.id);

                // Rate limit: Don't notify for the same "Hot Demand" keyword within 6 hours
                const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
                const recentAlert = await this.notificationLogRepo.findOne({
                    where: {
                        vendorId: business.vendor.id,
                        keyword: `HOT:${insight.normalizedKeyword}`,
                        sentAt: MoreThan(sixHoursAgo)
                    }
                });

                if (recentAlert) continue;

                await this.sendAlert(business.vendor, insight);
            }
        }
    }

    private async sendAlert(vendor: Vendor, insight: DemandInsight) {
        const title = '🔥 High Demand Alert';
        const message = `Search demand for "${insight.keyword}" services is rising rapidly! Make sure your profile is optimized to capture new leads.`;

        await this.notificationsService.create({
            userId: vendor.userId,
            title,
            message,
            type: 'hot_demand',
            data: {
                keyword: insight.keyword,
                score: insight.score,
                growth: insight.growth
            }
        });

        // Log the alert
        await this.notificationLogRepo.save({
            vendorId: vendor.id,
            keyword: `HOT:${insight.normalizedKeyword}`,
            status: 'sent'
        });

        this.logger.log(`Demand alert sent to vendor ${vendor.id} for "${insight.keyword}"`);
    }
}
