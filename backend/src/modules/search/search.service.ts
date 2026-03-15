import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Listing, BusinessStatus } from '../../entities/business.entity';
import { SearchBusinessDto } from '../businesses/dto/search-business.dto';
import { DayOfWeek } from '../../entities/business-hours.entity';

@Injectable()
export class SearchService implements OnModuleInit {
    private INDEX_NAME = 'businesses';
    private isElasticAvailable = false;
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly configService: ConfigService,
        @InjectRepository(Listing)
        private readonly businessRepository: Repository<Listing>,
    ) { }

    async onModuleInit() {
        const isEnabled = this.configService.get<string>('ELASTICSEARCH_ENABLED') === 'true';

        if (!isEnabled) {
            this.isElasticAvailable = false;
            this.logger.log('ℹ️ Elasticsearch is disabled by configuration. Using database search.');
            return;
        }

        this.INDEX_NAME = this.configService.get<string>('ELASTICSEARCH_INDEX') || 'businesses';

        try {
            await this.elasticsearchService.ping();
            this.isElasticAvailable = true;
            this.logger.log('✅ Elasticsearch is available. Creating index if needed...');
            await this.createIndex();
            this.logger.log('✅ Elasticsearch index ready.');
        } catch (error) {
            this.isElasticAvailable = false;
            this.logger.warn(`⚠️ Elasticsearch is enabled but not reachable: ${error.message}`);
            this.logger.debug(error);
        }
    }

    /**
     * Check if Elasticsearch is available
     */
    isAvailable() {
        return this.isElasticAvailable;
    }

    /**
     * Create index with appropriate mapping
     */
    private async createIndex() {
        const indexExists = await this.elasticsearchService.indices.exists({
            index: this.INDEX_NAME,
        });

        if (!indexExists) {
            await this.elasticsearchService.indices.create({
                index: this.INDEX_NAME,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            title: { type: 'text', analyzer: 'standard' },
                            slug: { type: 'keyword' },
                            description: { type: 'text' },
                            category: { type: 'keyword' },
                            city: { type: 'keyword' },
                            address: { type: 'text' },
                            logoUrl: { type: 'keyword' },
                            coverImageUrl: { type: 'keyword' },
                            location: { type: 'geo_point' },
                            rating: { type: 'float' },
                            isFeatured: { type: 'boolean' },
                            isVerified: { type: 'boolean' },
                            status: { type: 'keyword' },
                            followersCount: { type: 'integer' },
                        },
                    },
                },
            });
        }
    }

    /**
     * Index a single business
     */
    async indexBusiness(business: Listing) {
        if (!this.isElasticAvailable) return;
        return this.elasticsearchService.index({
            index: this.INDEX_NAME,
            id: business.id,
            body: {
                id: business.id,
                title: business.title,
                slug: business.slug,
                description: business.description,
                category: business.category?.name,
                city: business.city,
                address: business.address,
                logoUrl: business.logoUrl,
                coverImageUrl: business.coverImageUrl,
                location: {
                    lat: business.latitude,
                    lon: business.longitude,
                },
                rating: business.averageRating,
                isFeatured: business.isFeatured,
                isVerified: business.isVerified,
                status: business.status,
                followersCount: business.followersCount || 0,
            },
        });
    }

    /**
     * Database-based fallback search using TypeORM
     */
    private async dbSearch(searchDto: SearchBusinessDto): Promise<any[]> {
        const {
            query,
            city,
            categorySlug,
            minRating,
            latitude,
            longitude,
            radius,
            openNow,
            verifiedOnly,
            featuredOnly,
            limit = 50,
            page = 1
        } = searchDto;

        const skip = (page - 1) * limit;
        const take = limit;

        this.logger.log(`[DB Fallback] Search params: ${JSON.stringify(searchDto)}`);

        const qb = this.businessRepository
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.category', 'category')
            .where('b.status = :status', { status: BusinessStatus.APPROVED });

        if (query) {
            const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
            for (const term of searchTerms) {
                qb.andWhere(
                    new Brackets((innerQb) => {
                        innerQb.where('LOWER(b.name) LIKE :term', { term: `%${term}%` })
                            .orWhere('LOWER(b.description) LIKE :term', { term: `%${term}%` })
                            .orWhere('LOWER(b.city) LIKE :term', { term: `%${term}%` })
                            .orWhere('LOWER(category.name) LIKE :term', { term: `%${term}%` });
                    }),
                    { term: `%${term}%` }
                );
            }
        }

        if (city) {
            qb.andWhere('LOWER(b.city) = :city', { city: city.toLowerCase() });
        }

        if (categorySlug) {
            qb.andWhere('category.slug = :categorySlug', { categorySlug });
        }

        if (minRating) {
            qb.andWhere('b.averageRating >= :minRating', { minRating });
        }

        if (verifiedOnly) {
            qb.andWhere('b.isVerified = :verifiedOnly', { verifiedOnly: true });
        }

        if (featuredOnly) {
            qb.andWhere('b.isFeatured = :featuredOnly', { featuredOnly: true });
        }

        // Distance Filter (Earthdistance)
        if (latitude && longitude) {
            // earth_distance uses meters, radius is in km so multiply by 1000
            const formula = `earth_distance(ll_to_earth(b.latitude, b.longitude), ll_to_earth(:lat, :lng))`;
            qb.addSelect(`${formula} / 1000`, 'distance');
            qb.setParameters({ lat: latitude, lng: longitude });

            if (radius) {
                // radius is in km, comparison in meters
                const radiusInMeters = radius * 1000;
                qb.andWhere(`${formula} <= :radiusInMeters`, { radiusInMeters });
            }
            qb.addOrderBy('distance', 'ASC');
        }

        // Open Now Filter
        if (openNow) {
            const now = new Date();
            const days = [
                DayOfWeek.SUNDAY,
                DayOfWeek.MONDAY,
                DayOfWeek.TUESDAY,
                DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY,
                DayOfWeek.SATURDAY,
            ];
            const currentDay = days[now.getDay()];
            const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

            qb.innerJoin('b.businessHours', 'bh', 'bh.dayOfWeek = :currentDay AND bh.isOpen = true', { currentDay });
            qb.andWhere(':currentTime BETWEEN bh.openTime AND bh.closeTime', { currentTime });
        }

        qb.addOrderBy('b.isFeatured', 'DESC')
            .addOrderBy('b.averageRating', 'DESC')
            .skip(skip)
            .take(take);

        const results = await qb.getMany();

        return results.map((b) => ({
            id: b.id,
            title: b.title,
            description: b.description,
            category: b.category?.name,
            city: b.city,
            location: { lat: b.latitude, lon: b.longitude },
            rating: b.averageRating,
            isFeatured: b.isFeatured,
            isVerified: b.isVerified,
            status: b.status,
            slug: b.slug,
            logoUrl: b.logoUrl,
            coverImageUrl: b.coverImageUrl,
            phone: b.phone,
            address: b.address,
            followersCount: b.followersCount,
        }));
    }

    async search(searchDto: SearchBusinessDto) {
        if (!this.isElasticAvailable) {
            return this.dbSearch(searchDto);
        }

        const { query, city, categorySlug, minRating, latitude, longitude, radius, openNow, verifiedOnly } = searchDto;

        const filters: any[] = [{ term: { status: 'approved' } }];

        if (city) {
            filters.push({ term: { city: city.toLowerCase() } });
        }

        if (categorySlug) {
            filters.push({ term: { category_slug: categorySlug } });
        }

        if (minRating) {
            filters.push({ range: { rating: { gte: minRating } } });
        }

        if (verifiedOnly) {
            filters.push({ term: { isVerified: true } });
        }

        if (latitude && longitude && radius) {
            filters.push({
                geo_distance: {
                    distance: `${radius}km`,
                    location: {
                        lat: latitude,
                        lon: longitude,
                    },
                },
            });
        }

        // Note: Open Now for ES requires complex script filters or checking against indexed hours
        // For simplicity, we'll implement it if needed or warn that it's limited in ES for now.

        const response = await this.elasticsearchService.search({
            index: this.INDEX_NAME,
            body: {
                query: {
                    function_score: {
                        query: {
                            bool: {
                                must: {
                                    multi_match: {
                                        query,
                                        fields: ['title^3', 'description', 'category', 'address'],
                                    },
                                },
                                filter: filters,
                            },
                        },
                        functions: [
                            {
                                field_value_factor: {
                                    field: 'followersCount',
                                    factor: 1.2,
                                    modifier: 'log1p',
                                    missing: 0,
                                },
                            },
                        ],
                        boost_mode: 'multiply',
                    },
                },
            },
        });

        return response.hits.hits.map((hit: any) => ({
            ...hit._source,
            score: hit._score,
        }));
    }

    /**
     * Search only for IDs (useful for combining with TypeORM)
     */
    async searchIds(query: string, city?: string, category?: string, limit = 100): Promise<string[]> {
        if (!this.isElasticAvailable) return [];

        const filters: any[] = [{ term: { status: 'approved' } }];
        if (city) filters.push({ term: { city: city.toLowerCase() } });
        if (category) filters.push({ term: { category: category.toLowerCase() } });

        const response = await this.elasticsearchService.search({
            index: this.INDEX_NAME,
            size: limit,
            body: {
                _source: false,
                query: {
                    function_score: {
                        query: {
                            bool: {
                                must: {
                                    multi_match: {
                                        query,
                                        fields: ['title^3', 'description', 'category', 'address'],
                                    },
                                },
                                filter: filters,
                            },
                        },
                    },
                },
            },
        });

        return response.hits.hits.map((hit: any) => hit._id);
    }

    /**
     * Bulk re-index (Sync DB to ES)
     */
    async reindexAll() {
        if (!this.isElasticAvailable) {
            this.logger.warn('[reindexAll] Elasticsearch not available. Skipping re-index.');
            return { indexed: 0, message: 'Elasticsearch is not available.' };
        }

        const businesses = await this.businessRepository.find({
            relations: ['category'],
        });

        for (const business of businesses) {
            await this.indexBusiness(business);
        }

        return { indexed: businesses.length };
    }

    /**
     * Remove from index
     */
    async remove(businessId: string) {
        if (!this.isElasticAvailable) return;
        await this.elasticsearchService.delete({
            index: this.INDEX_NAME,
            id: businessId,
        });
    }
}
