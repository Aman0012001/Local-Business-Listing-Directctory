import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    /**
     * Create a new category
     */
    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const { name, parentId } = createCategoryDto;

        // Generate slug from name
        const slug = generateSlug(name);

        // Check if slug already exists
        const existingCategory = await this.categoryRepository.findOne({
            where: { slug },
        });

        if (existingCategory) {
            throw new ConflictException('Category with this name already exists');
        }

        // Verify parent category exists if parentId provided
        if (parentId) {
            const parentCategory = await this.categoryRepository.findOne({
                where: { id: parentId },
            });

            if (!parentCategory) {
                throw new NotFoundException('Parent category not found');
            }
        }

        // Create category
        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
        });

        return this.categoryRepository.save(category);
    }

    /**
     * Get all categories with optional subcategories
     */
    async findAll(includeSubcategories = false): Promise<Category[]> {
        const queryBuilder = this.categoryRepository
            .createQueryBuilder('category')
            .where('category.isActive = :isActive', { isActive: true })
            .orderBy('category.displayOrder', 'ASC')
            .addOrderBy('category.name', 'ASC');

        if (includeSubcategories) {
            queryBuilder.leftJoinAndSelect('category.subcategories', 'subcategories');
        }

        return queryBuilder.getMany();
    }

    /**
     * Get root categories (no parent)
     */
    async findRootCategories(): Promise<Category[]> {
        return this.categoryRepository.find({
            where: {
                parentId: IsNull(),
                isActive: true,
            },
            relations: ['subcategories'],
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }

    /**
     * Get category tree (hierarchical structure)
     */
    async getCategoryTree(): Promise<Category[]> {
        const rootCategories = await this.categoryRepository.find({
            where: {
                parentId: IsNull(),
                isActive: true,
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });

        // Load subcategories recursively
        for (const category of rootCategories) {
            await this.loadSubcategories(category);
        }

        return rootCategories;
    }

    /**
     * Load subcategories recursively
     */
    private async loadSubcategories(category: Category): Promise<void> {
        const subcategories = await this.categoryRepository.find({
            where: {
                parentId: category.id,
                isActive: true,
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });

        category.subcategories = subcategories;

        // Recursively load subcategories for each subcategory
        for (const subcategory of subcategories) {
            await this.loadSubcategories(subcategory);
        }
    }

    /**
     * Get category by ID
     */
    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'subcategories', 'businesses'],
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    /**
     * Get category by slug
     */
    async findBySlug(slug: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { slug: ILike(slug.trim()) },
            relations: ['parent', 'subcategories', 'businesses'],
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    /**
     * Get subcategories of a category
     */
    async getSubcategories(parentId: string): Promise<Category[]> {
        const parent = await this.categoryRepository.findOne({
            where: { id: parentId },
        });

        if (!parent) {
            throw new NotFoundException('Parent category not found');
        }

        return this.categoryRepository.find({
            where: {
                parentId,
                isActive: true,
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }

    /**
     * Update category
     */
    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Update slug if name changed
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const slug = generateSlug(updateCategoryDto.name);

            // Check if new slug already exists
            const existingCategory = await this.categoryRepository.findOne({
                where: { slug },
            });

            if (existingCategory && existingCategory.id !== id) {
                throw new ConflictException('Category with this name already exists');
            }

            updateCategoryDto['slug'] = slug;
        }

        // Verify parent category exists if parentId changed
        if (updateCategoryDto.parentId) {
            // Prevent circular reference
            if (updateCategoryDto.parentId === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }

            const parentCategory = await this.categoryRepository.findOne({
                where: { id: updateCategoryDto.parentId },
            });

            if (!parentCategory) {
                throw new NotFoundException('Parent category not found');
            }

            // Check if new parent is a descendant of current category
            const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
            if (isDescendant) {
                throw new BadRequestException(
                    'Cannot set a descendant category as parent (circular reference)',
                );
            }
        }

        await this.categoryRepository.update(id, updateCategoryDto);

        return this.findOne(id);
    }

    /**
     * Check if a category is a descendant of another
     */
    private async isDescendant(ancestorId: string, categoryId: string): Promise<boolean> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        });

        if (!category || !category.parentId) {
            return false;
        }

        if (category.parentId === ancestorId) {
            return true;
        }

        return this.isDescendant(ancestorId, category.parentId);
    }

    /**
     * Delete category
     */
    async remove(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['subcategories', 'businesses'],
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Check if category has subcategories
        if (category.subcategories && category.subcategories.length > 0) {
            throw new BadRequestException(
                'Cannot delete category with subcategories. Delete subcategories first.',
            );
        }

        // Check if category has businesses
        if (category.businesses && category.businesses.length > 0) {
            throw new BadRequestException(
                'Cannot delete category with businesses. Reassign businesses first.',
            );
        }

        await this.categoryRepository.remove(category);
    }

    /**
     * Get popular categories (by business count)
     */
    async getPopularCategories(limit = 10): Promise<any[]> {
        const query = this.categoryRepository
            .createQueryBuilder('category')
            .leftJoin('category.businesses', 'business', 'business.status = :status', { status: 'approved' })
            .where('category.isActive = :isActive', { isActive: true })
            .select([
                'category.id',
                'category.name',
                'category.slug',
                'category.iconUrl',
                'category.description'
            ])
            .addSelect('COUNT(business.id)', 'businessCount')
            .groupBy('category.id')
            .orderBy('COUNT(business.id)', 'DESC')
            .addOrderBy('category.name', 'ASC')
            .limit(limit);

        const results = await query.getRawMany();

        return results.map(res => ({
            id: res.category_id,
            name: res.category_name,
            slug: res.category_slug,
            iconUrl: res.category_icon_url,
            description: res.category_description,
            businessCount: parseInt(res.businessCount || '0'),
        }));
    }
}
