import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessStatus } from '../../entities/business.entity';

@Injectable()
export class BusinessesService {
    constructor(
        @InjectRepository(Business)
        private businessesRepository: Repository<Business>,
    ) { }

    async findAll(options: any = {}): Promise<{ data: Business[], total: number, page: number, limit: number }> {
        const { limit = 10, page = 1, sort = 'createdAt' } = options;
        const [data, total] = await this.businessesRepository.findAndCount({
            where: { status: BusinessStatus.APPROVED },
            take: limit,
            skip: (page - 1) * limit,
            order: { [sort]: 'DESC' },
            relations: ['category']
        });

        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit)
        };
    }

    async findOne(id: string): Promise<Business | null> {
        return this.businessesRepository.findOne({
            where: { id },
            relations: ['category', 'vendor']
        });
    }

    async findBySlug(slug: string): Promise<Business | null> {
        return this.businessesRepository.findOne({
            where: { slug },
            relations: ['category', 'vendor']
        });
    }

    async search(params: any): Promise<{ data: Business[], total: number, page: number, limit: number }> {
        const { limit = 20, page = 1, featuredOnly, verifiedOnly, categorySlug, city, query, minRating } = params;

        const queryBuilder = this.businessesRepository.createQueryBuilder('business')
            .leftJoinAndSelect('business.category', 'category')
            .leftJoinAndSelect('business.vendor', 'vendor')
        // Base condition: Approved status
        queryBuilder.where('business.status = :status', { status: BusinessStatus.APPROVED });

        // Featured filtering - handles "true", true, and "featured" value from multiple sources
        const shouldShowFeaturedOnly = params.featuredOnly === 'true' || params.featuredOnly === true || params.filter === 'featured';
        if (shouldShowFeaturedOnly) {
            queryBuilder.andWhere('business.isFeatured = :isFeaturedVal', { isFeaturedVal: true });
        }

        // Verified filtering - joined from vendor
        const shouldShowVerifiedOnly = params.verifiedOnly === 'true' || params.verifiedOnly === true;
        if (shouldShowVerifiedOnly) {
            queryBuilder.andWhere('vendor.isVerified = :isVerifiedVal', { isVerifiedVal: true });
        }

        if (categorySlug) {
            queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug });
        }

        if (city) {
            queryBuilder.andWhere('LOWER(business.city) = LOWER(:city)', { city });
        }

        if (minRating) {
            queryBuilder.andWhere('business.averageRating >= :minRating', { minRating: Number(minRating) });
        }

        if (query) {
            queryBuilder.andWhere('(LOWER(business.name) LIKE LOWER(:query) OR LOWER(business.description) LIKE LOWER(:query))', { query: `%${query}%` });
        }

        // Apply sorting
        if (params.filter === 'new') {
            queryBuilder.orderBy('business.createdAt', 'DESC');
            queryBuilder.addOrderBy('business.isFeatured', 'DESC');
        } else {
            // Default: Featured first, then newest
            queryBuilder.orderBy('business.isFeatured', 'DESC');
            queryBuilder.addOrderBy('business.createdAt', 'DESC');
        }

        const [data, total] = await queryBuilder
            .take(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .getManyAndCount();

        return {
            data,
            total,
            page: Number(page),
            limit: Number(limit)
        };
    }
}
