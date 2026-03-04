import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto): Promise<import("../../entities").Category>;
    findAll(includeSubcategories?: boolean): Promise<import("../../entities").Category[]>;
    getCategoryTree(): Promise<import("../../entities").Category[]>;
    findRootCategories(): Promise<import("../../entities").Category[]>;
    getPopularCategories(limit?: number): Promise<any[]>;
    findBySlug(slug: string): Promise<import("../../entities").Category>;
    findOne(id: string): Promise<import("../../entities").Category>;
    getSubcategories(id: string): Promise<import("../../entities").Category[]>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("../../entities").Category>;
    remove(id: string): Promise<void>;
}
