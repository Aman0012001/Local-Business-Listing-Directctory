import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../../entities/business.entity';

@Controller('cities')
export class CitiesController {
    constructor(
        @InjectRepository(Business)
        private businessesRepository: Repository<Business>,
    ) { }

    @Get('popular')
    async getPopular() {
        const cities = await this.businessesRepository
            .createQueryBuilder('business')
            .select('business.city', 'name')
            .addSelect('COUNT(business.id)', 'businessCount')
            .groupBy('business.city')
            .orderBy('COUNT(business.id)', 'DESC')
            .limit(10)
            .getRawMany();

        return cities.map(city => ({
            id: city.name,
            name: city.name,
            slug: city.name.toLowerCase().replace(/ /g, '-'),
            businessCount: parseInt(city.businessCount),
            imageUrl: `https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=400` // Default fallback
        }));
    }
}
