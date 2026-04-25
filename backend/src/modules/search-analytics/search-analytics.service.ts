import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchLog } from '../../entities/search-log.entity';

@Injectable()
export class SearchAnalyticsService {
    constructor(
        @InjectRepository(SearchLog)
        private searchLogRepository: Repository<SearchLog>,
    ) {}

    async getOverview(startDate?: string, endDate?: string, city?: string) {
        const query = this.searchLogRepository.createQueryBuilder('log');
        
        if (startDate) query.andWhere('log.searchedAt >= :startDate', { startDate });
        if (endDate) query.andWhere('log.searchedAt <= :endDate', { endDate });
        if (city) query.andWhere('log.city = :city', { city });

        const totalSearches = await query.getCount();
        
        const uniqueUsersResult = await this.searchLogRepository.query(
            `SELECT COUNT(DISTINCT COALESCE(user_id::text, ip_address)) as count 
             FROM search_logs 
             WHERE 1=1 
             ${startDate ? 'AND searched_at >= $1' : ''} 
             ${endDate ? `AND searched_at <= $${startDate ? '2' : '1'}` : ''}
             ${city ? `AND city = $${(startDate ? 1 : 0) + (endDate ? 1 : 0) + 1}` : ''}`,
            [...(startDate ? [startDate] : []), ...(endDate ? [endDate] : []), ...(city ? [city] : [])].filter(Boolean)
        );
        const uniqueUsers = parseInt(uniqueUsersResult[0]?.count || '0', 10);

        const noResultQuery = this.searchLogRepository.createQueryBuilder('log')
            .where('log.resultsCount = 0');
        if (startDate) noResultQuery.andWhere('log.searchedAt >= :startDate', { startDate });
        if (endDate) noResultQuery.andWhere('log.searchedAt <= :endDate', { endDate });
        if (city) noResultQuery.andWhere('log.city = :city', { city });
        const noResultSearches = await noResultQuery.getCount();

        const avgSearchPerUser = uniqueUsers > 0 ? (totalSearches / uniqueUsers).toFixed(2) : 0;

        return {
            totalSearches,
            uniqueUsers,
            noResultSearches,
            avgSearchPerUser: Number(avgSearchPerUser),
        };
    }

    async getTopKeywords(startDate?: string, endDate?: string, city?: string, limit: number = 10) {
        const query = this.searchLogRepository.createQueryBuilder('log')
            .select('log.keyword', 'keyword')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.keyword IS NOT NULL')
            .andWhere('log.keyword != \'\'')
            .groupBy('log.keyword')
            .orderBy('count', 'DESC')
            .limit(limit);

        if (startDate) query.andWhere('log.searchedAt >= :startDate', { startDate });
        if (endDate) query.andWhere('log.searchedAt <= :endDate', { endDate });
        if (city) query.andWhere('log.city = :city', { city });

        return await query.getRawMany();
    }

    async getTopCities(startDate?: string, endDate?: string, limit: number = 10) {
        const query = this.searchLogRepository.createQueryBuilder('log')
            .select('log.city', 'city')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.city IS NOT NULL')
            .andWhere('log.city != \'\'')
            .groupBy('log.city')
            .orderBy('count', 'DESC')
            .limit(limit);

        if (startDate) query.andWhere('log.searchedAt >= :startDate', { startDate });
        if (endDate) query.andWhere('log.searchedAt <= :endDate', { endDate });

        return await query.getRawMany();
    }

    async getNoResults(startDate?: string, endDate?: string, city?: string, limit: number = 10) {
        const query = this.searchLogRepository.createQueryBuilder('log')
            .select('log.keyword', 'keyword')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.resultsCount = 0')
            .andWhere('log.keyword IS NOT NULL')
            .andWhere('log.keyword != \'\'')
            .groupBy('log.keyword')
            .orderBy('count', 'DESC')
            .limit(limit);

        if (startDate) query.andWhere('log.searchedAt >= :startDate', { startDate });
        if (endDate) query.andWhere('log.searchedAt <= :endDate', { endDate });
        if (city) query.andWhere('log.city = :city', { city });

        return await query.getRawMany();
    }

    async getTrends(startDate?: string, endDate?: string, city?: string) {
        const query = this.searchLogRepository.createQueryBuilder('log')
            .select('DATE("searched_at")', 'date')
            .addSelect('COUNT("id")', 'count')
            .groupBy('DATE("searched_at")')
            .orderBy('date', 'ASC');

        if (startDate) query.andWhere('log.searchedAt >= :startDate', { startDate });
        if (endDate) query.andWhere('log.searchedAt <= :endDate', { endDate });
        if (city) query.andWhere('log.city = :city', { city });

        return await query.getRawMany();
    }
}
