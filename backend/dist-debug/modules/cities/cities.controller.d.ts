import { CitiesService } from './cities.service';
export declare class CitiesController {
    private readonly citiesService;
    constructor(citiesService: CitiesService);
    findAll(): Promise<import("../../entities").City[]>;
    findPopular(): Promise<import("../../entities").City[]>;
    findBySlug(slug: string): Promise<import("../../entities").City>;
}
