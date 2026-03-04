"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const elasticsearch_1 = require("@nestjs/elasticsearch");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../../entities/business.entity");
let SearchService = class SearchService {
    constructor(elasticsearchService, businessRepository) {
        this.elasticsearchService = elasticsearchService;
        this.businessRepository = businessRepository;
        this.INDEX_NAME = 'businesses';
    }
    async onModuleInit() {
        try {
            await this.createIndex();
        }
        catch (error) {
            console.warn('⚠️ Elasticsearch is not available. Search features will be limited.');
        }
    }
    async createIndex() {
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
    async indexBusiness(business) {
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
            },
        });
    }
    async search(query, city, category) {
        const filters = [{ term: { status: 'approved' } }];
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
                            fields: ['title^3', 'description', 'category'],
                        },
                    },
                    filter: filters,
                },
            },
        });
        return response.hits.hits.map((hit) => hit._source);
    }
    async reindexAll() {
        const businesses = await this.businessRepository.find({
            relations: ['category'],
        });
        for (const business of businesses) {
            await this.indexBusiness(business);
        }
        return { indexed: businesses.length };
    }
    async remove(businessId) {
        await this.elasticsearchService.delete({
            index: this.INDEX_NAME,
            id: businessId,
        });
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __metadata("design:paramtypes", [elasticsearch_1.ElasticsearchService,
        typeorm_2.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map