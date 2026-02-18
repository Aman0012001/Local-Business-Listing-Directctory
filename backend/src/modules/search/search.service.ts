import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../entities/business.entity';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly INDEX_NAME = 'businesses';

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        @InjectRepository(Business)
        private readonly businessRepository: Repository<Business>,
    ) { }

    async onModuleInit() {
        try {
            await this.createIndex();
        } catch (error) {
            console.warn('⚠️ Elasticsearch is not available. Search features will be limited.');
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
                        },
                    },
                },
            });
        }
    }

    /**
     * Index a single business
     */
    async indexBusiness(business: Business) {
        return this.elasticsearchService.index({
            index: this.INDEX_NAME,
            id: business.id,
            body: {
                id: business.id,
                name: business.name,
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
            },
        });
    }

    /**
     * Search businesses with Elasticsearch
     */
    async search(query: string, city?: string, category?: string) {
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
                bool: {
                    must: {
                        multi_match: {
                            query,
                            fields: ['name^3', 'description', 'category'],
                        },
                    },
                    filter: filters,
                },
            },
        });

        return response.hits.hits.map((hit) => hit._source);
    }

    /**
     * Bulk re-index (Sync DB to ES)
     */
    async reindexAll() {
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
        await this.elasticsearchService.delete({
            index: this.INDEX_NAME,
            id: businessId,
        });
    }
}
