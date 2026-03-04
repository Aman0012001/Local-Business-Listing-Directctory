import { Repository } from 'typeorm';
import { City } from '../../entities/city.entity';
export declare class CitiesService {
    private readonly cityRepository;
    constructor(cityRepository: Repository<City>);
    findAll(): Promise<City[]>;
    findPopular(): Promise<City[]>;
    findBySlug(slug: string): Promise<City>;
}
