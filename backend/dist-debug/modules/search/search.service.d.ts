import { OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Repository } from 'typeorm';
import { Listing } from '../../entities/business.entity';
export declare class SearchService implements OnModuleInit {
    private readonly elasticsearchService;
    private readonly businessRepository;
    private readonly INDEX_NAME;
    constructor(elasticsearchService: ElasticsearchService, businessRepository: Repository<Listing>);
    onModuleInit(): Promise<void>;
    private createIndex;
    indexBusiness(business: Listing): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    search(query: string, city?: string, category?: string): Promise<unknown[]>;
    reindexAll(): Promise<{
        indexed: number;
    }>;
    remove(businessId: string): Promise<void>;
}
