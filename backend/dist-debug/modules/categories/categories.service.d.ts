import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(includeSubcategories?: boolean): Promise<Category[]>;
    findRootCategories(): Promise<Category[]>;
    getCategoryTree(): Promise<Category[]>;
    private loadSubcategories;
    findOne(id: string): Promise<Category>;
    findBySlug(slug: string): Promise<Category>;
    getSubcategories(parentId: string): Promise<Category[]>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    private isDescendant;
    remove(id: string): Promise<void>;
    getPopularCategories(limit?: number): Promise<any[]>;
}
