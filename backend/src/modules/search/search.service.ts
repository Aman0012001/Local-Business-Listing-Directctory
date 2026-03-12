import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing, BusinessStatus } from '../../entities/business.entity';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly INDEX_NAME = 'businesses';
    private isElasticAvailable = false;
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        @InjectRepository(Listing)
        private readonly businessRepository: Repository<Listing>,
    ) { }

    async onModuleInit() {
        try {
            await this.elasticsearchService.ping();
            this.isElasticAvailable = true;
            this.logger.log('✅ Elasticsearch is available. Creating index if needed...');
            await this.createIndex();
            this.logger.log('✅ Elasticsearch index ready.');
        } catch (error) {
            this.isElasticAvailable = false;
            this.logger.warn('⚠️ Elasticsearch is not available. Search will use database fallback.');
        }
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
                            name: { type: 'text', analyzer: 'standard' },
                            description: { type: 'text' },
                            category: { type: 'keyword' },
                            city: { type: 'keyword' },
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
                description: business.description,
                category: business.category?.name,
                city: business.city,
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
    private async dbSearch(query: string, city?: string, category?: string): Promise<any[]> {
        this.logger.log(`[DB Fallback] Searching for: "${query}", city: ${city}, category: ${category}`);

        const qb = this.businessRepository
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.category', 'category')
            .where('b.status = :status', { status: BusinessStatus.APPROVED });

        if (query) {
            qb.andWhere(
                `(LOWER(b.name) LIKE :q OR LOWER(b.description) LIKE :q OR LOWER(b.city) LIKE :q)`,
                { q: `%${query.toLowerCase()}%` },
            );
        }

        if (city) {
            qb.andWhere('LOWER(b.city) = :city', { city: city.toLowerCase() });
        }

        if (category) {
            qb.andWhere('LOWER(category.name) LIKE :cat', { cat: `%${category.toLowerCase()}%` });
        }

        qb.orderBy('b.isFeatured', 'DESC')
            .addOrderBy('b.averageRating', 'DESC')
            .take(50);

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

    /**
     * Search businesses — uses Elasticsearch if available, DB fallback otherwise
     */
    async search(query: string, city?: string, category?: string) {
        if (!this.isElasticAvailable) {
            return this.dbSearch(query, city, category);
        }

        const filters: any[] = [{ term: { status: 'approved' } }];

        if (city) {
            filters.push({ term: { city } });
        }

        if (category) {
            filters.push({ term: { category } });
        }

        const response = await this.elasticsearchService.search({
            index: this.INDEX_NAME,
            query: {
                function_score: {
                    query: {
                        bool: {
                            must: {
                                multi_match: {
                                    query,
                                    fields: ['title^3', 'description', 'category'],
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
        });

        return response.hits.hits.map((hit) => hit._source);
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
