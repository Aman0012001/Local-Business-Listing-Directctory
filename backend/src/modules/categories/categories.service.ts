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
        const { name, slug: providedSlug } = createCategoryDto;

        // Use provided slug or generate from name
        const slug = providedSlug || generateSlug(name);

        // Check if slug or name already exists
        const existingCategory = await this.categoryRepository.findOne({
            where: [{ name: ILike(name) }, { slug: ILike(slug) }],
        });

        if (existingCategory) {
            throw new ConflictException('Category with this name or slug already exists');
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
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }

    /**
     * Get active categories (Public)
     */
    async findAllActive(): Promise<Category[]> {
        return this.categoryRepository.find({
            where: { status: CategoryStatus.ACTIVE },
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }

    /**
     * Get category by ID
     */
    async findOne(id: string): Promise<Category> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['businesses'],
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
            relations: ['businesses'],
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
     * Delete category
     */
    async remove(id: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['businesses'],
        });

        if (!category) {
            throw new NotFoundException('Category not found');
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
