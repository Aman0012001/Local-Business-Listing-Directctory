import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { Category, CategoryStatus } from '../../entities/category.entity';
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
        const { name, parentId, slug: providedSlug } = createCategoryDto;

        // Use provided slug or generate from name
        const slug = providedSlug || generateSlug(name);

        // Check if slug or name already exists
        const existingCategory = await this.categoryRepository.findOne({
            where: [{ name: ILike(name) }, { slug: ILike(slug) }],
        });

        if (existingCategory) {
            throw new ConflictException('Category with this name or slug already exists');
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
     * Get all categories (Admin)
     */
    async findAllAdmin(): Promise<Category[]> {
        return this.categoryRepository.find({
            relations: ['parent'],
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }

    /**
     * Get active categories (Public)
     */
    async findAllActive(includeSubcategories = false): Promise<Category[]> {
        const queryBuilder = this.categoryRepository
            .createQueryBuilder('category')
            .where('category.status = :status', { status: CategoryStatus.ACTIVE })
            .orderBy('category.displayOrder', 'ASC')
            .addOrderBy('category.name', 'ASC');

        if (includeSubcategories) {
            queryBuilder.leftJoinAndSelect('category.subcategories', 'subcategories', 'subcategories.status = :active', { active: CategoryStatus.ACTIVE });
        }

        return queryBuilder.getMany();
    }

    /**
     * Get root categories (no parent) - ACTIVE ONLY
     */
    async findRootCategories(activeOnly = true): Promise<Category[]> {
        const where: any = { parentId: IsNull() };
        if (activeOnly) {
            where.status = CategoryStatus.ACTIVE;
        }

        return this.categoryRepository.find({
            where,
            relations: ['subcategories'],
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }

    /**
     * Get category tree (hierarchical structure) - ACTIVE ONLY
     */
    async getCategoryTree(activeOnly = true): Promise<Category[]> {
        const where: any = { parentId: IsNull() };
        if (activeOnly) {
            where.status = CategoryStatus.ACTIVE;
        }

        const rootCategories = await this.categoryRepository.find({
            where,
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });

        // Load subcategories recursively
        for (const category of rootCategories) {
            await this.loadSubcategories(category, activeOnly);
        }

        return rootCategories;
    }

    /**
     * Load subcategories recursively
     */
    private async loadSubcategories(category: Category, activeOnly: boolean): Promise<void> {
        const where: any = { parentId: category.id };
        if (activeOnly) {
            where.status = CategoryStatus.ACTIVE;
        }

        const subcategories = await this.categoryRepository.find({
            where,
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });

        category.subcategories = subcategories;

        // Recursively load subcategories for each subcategory
        for (const subcategory of subcategories) {
            await this.loadSubcategories(subcategory, activeOnly);
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
            where: {
                slug: ILike(slug.trim()),
                status: CategoryStatus.ACTIVE
            },
            relations: ['parent', 'subcategories', 'businesses'],
        });

        if (!category) {
            throw new NotFoundException('Active category not found');
        }

        return category;
    }

    /**
     * Update category
     */
    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        // Update slug if name changed and slug not provided
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            if (!updateCategoryDto.slug) {
                const slug = generateSlug(updateCategoryDto.name);

                // Check if new slug already exists
                const existingCategoryBySlug = await this.categoryRepository.findOne({
                    where: { slug: ILike(slug) },
                });

                if (existingCategoryBySlug && existingCategoryBySlug.id !== id) {
                    throw new ConflictException('Category with this name already exists');
                }

                updateCategoryDto['slug'] = slug;
            }
        }

        // If specific slug provided, check for uniqueness
        if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
            const existingCategoryBySlug = await this.categoryRepository.findOne({
                where: { slug: ILike(updateCategoryDto.slug) },
            });

            if (existingCategoryBySlug && existingCategoryBySlug.id !== id) {
                throw new ConflictException('Category with this slug already exists');
            }
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
     * Update category status
     */
    async updateStatus(id: string, status: CategoryStatus): Promise<Category> {
        const category = await this.findOne(id);
        category.status = status;
        return this.categoryRepository.save(category);
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
            .where('category.status = :isActive', { isActive: CategoryStatus.ACTIVE })
            .select([
                'category.id',
                'category.name',
                'category.slug',
                'category.icon',
                'category.image_url',
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
            icon: res.category_icon,
            imageUrl: res.category_image_url,
            description: res.category_description,
            businessCount: parseInt(res.businessCount || '0'),
        }));
    }
}
