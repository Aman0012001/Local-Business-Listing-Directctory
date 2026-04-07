import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between, MoreThan } from 'typeorm';
import { SearchLog, NotificationLog, Listing, City, Vendor } from '../../entities';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
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
        private notificationLogRepository: Repository<NotificationLog>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
        @InjectRepository(City)
        private cityRepository: Repository<City>,
        private configService: ConfigService,
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
        let { latitude, longitude } = data;

        // Fallback to city coordinates if lat/lng missing
        if ((!latitude || !longitude) && data.city) {
            try {
                const city = await this.cityRepository.createQueryBuilder('city')
                    .where('LOWER(city.name) = LOWER(:cityName)', { cityName: data.city })
                    .orWhere('LOWER(city.slug) = LOWER(:cityName)', { cityName: data.city })
                    .getOne();
                
                if (city?.latitude && city?.longitude) {
                    latitude = Number(city.latitude);
                    longitude = Number(city.longitude);
                }
            } catch (error) {
                this.logger.error(`Failed to fetch city coordinates for fallback: ${data.city}`, error);
            }
        }

        const log = this.searchLogRepository.create({
            ...data,
            latitude,
            longitude,
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

    /**
     * Get AI-generated summary of demand insights
     */
    async getAIInsightsSummary(city?: string): Promise<string> {
        const insights = await this.getInsights(city);
        
        if (insights.length === 0) {
            return "No significant search patterns detected in the last 24 hours to generate an AI summary.";
        }

        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not found in configuration. Skipping AI summary generation.');
            return "AI summary is currently unavailable. Please configure GEMINI_API_KEY in the environment.";
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const insightData = insights.map(i => 
                `- ${i.keyword}: ${i.count1h} searches in last hr, ${i.count24h} in 24hr. Growth: ${i.growth}%. Status: ${i.isTrending ? 'Trending' : 'Stable'}`
            ).join('\n');

            const prompt = `
                Analyze the following search demand data for a local business listing platform${city ? ` in ${city}` : ''}:
                
                ${insightData}
                
                Provide a concise, professional summary of the current market demand. 
                Identify the hottest categories, any sudden spikes, and provide a single actionable recommendation for platform administrators (e.g., reaching out to specific vendor types).
                Keep the response under 150 words and use a helpful, insights-driven tone.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            this.logger.error(`Error generating AI summary: ${error.message}`);
            return "Failed to generate AI demand summary at this time.";
        }
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
        const businesses = await this.listingRepository.createQueryBuilder('listing')
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
                const recentAlert = await this.notificationLogRepository.findOne({
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
        await this.notificationLogRepository.save({
            vendorId: vendor.id,
            keyword: `HOT:${insight.normalizedKeyword}`,
            status: 'sent'
        });

        this.logger.log(`Demand alert sent to vendor ${vendor.id} for "${insight.keyword}"`);
    }
}
