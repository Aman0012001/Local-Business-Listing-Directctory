import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../../entities/city.entity';

@Injectable()
export class CitiesService {
    constructor(
        @InjectRepository(City)
        private readonly cityRepository: Repository<City>,
    ) { }

    async findAll() {
        return this.cityRepository.find({
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }

    async findPopular() {
        return this.cityRepository.find({
            where: { isPopular: true },
            order: { displayOrder: 'ASC' },
        });
    }

    async findBySlug(slug: string) {
        const city = await this.cityRepository.findOne({
            where: { slug },
        });

        if (!city) {
            throw new NotFoundException(`City with slug ${slug} not found`);
        }

        return city;
    }
}
