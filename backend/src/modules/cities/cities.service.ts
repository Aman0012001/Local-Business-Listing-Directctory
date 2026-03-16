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

    async create(data: Partial<City>) {
        if (!data.slug && data.name) {
            const { generateSlug } = await import('../../common/utils/slug.util');
            data.slug = generateSlug(data.name);
        }

        const existing = await this.cityRepository.findOne({
            where: { slug: data.slug },
        });

        if (existing) {
            return existing; // Or update it? Usually for import, we just return existing or update. Let's returning existing for now.
        }

        const city = this.cityRepository.create(data);
        return this.cityRepository.save(city);
    }

    async findAllAdmin(page = 1, limit = 10, search = '') {
        const queryBuilder = this.cityRepository.createQueryBuilder('city')
            .orderBy('city.displayOrder', 'ASC')
            .addOrderBy('city.name', 'ASC');

        if (search) {
            queryBuilder.where('city.name ILike :search OR city.slug ILike :search', { search: `%${search}%` });
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async remove(id: string) {
        const city = await this.cityRepository.findOne({ where: { id } });
        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }
        return this.cityRepository.remove(city);
    }
}
