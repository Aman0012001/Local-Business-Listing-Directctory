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

    async findAll(options: any = {}): Promise<Business[]> {
        const { limit = 10, sort = 'createdAt' } = options;
        return this.businessesRepository.find({
            where: { status: BusinessStatus.APPROVED },
            take: limit,
            order: { [sort]: 'DESC' },
            relations: ['category']
        });
    }

    async findOne(id: string): Promise<Business | null> {
        return this.businessesRepository.findOne({
            where: { id },
            relations: ['category', 'vendor']
        });
    }

    async search(params: any): Promise<Business[]> {
        // Simple search implementation
        return this.businessesRepository.find({
            where: { status: BusinessStatus.APPROVED },
            relations: ['category']
        });
    }
}
