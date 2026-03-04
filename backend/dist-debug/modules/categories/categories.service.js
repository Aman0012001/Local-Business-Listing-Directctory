"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../../entities/category.entity");
const slug_util_1 = require("../../common/utils/slug.util");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async create(createCategoryDto) {
        const { name, parentId } = createCategoryDto;
        const slug = (0, slug_util_1.generateSlug)(name);
        const existingCategory = await this.categoryRepository.findOne({
            where: { slug },
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Category with this name already exists');
        }
        if (parentId) {
            const parentCategory = await this.categoryRepository.findOne({
                where: { id: parentId },
            });
            if (!parentCategory) {
                throw new common_1.NotFoundException('Parent category not found');
            }
        }
        const category = this.categoryRepository.create({
            ...createCategoryDto,
            slug,
        });
        return this.categoryRepository.save(category);
    }
    async findAll(includeSubcategories = false) {
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
    async findRootCategories() {
        return this.categoryRepository.find({
            where: {
                parentId: (0, typeorm_2.IsNull)(),
                isActive: true,
            },
            relations: ['subcategories'],
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
    }
    async getCategoryTree() {
        const rootCategories = await this.categoryRepository.find({
            where: {
                parentId: (0, typeorm_2.IsNull)(),
                isActive: true,
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC',
            },
        });
        for (const category of rootCategories) {
            await this.loadSubcategories(category);
        }
        return rootCategories;
    }
    async loadSubcategories(category) {
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
        for (const subcategory of subcategories) {
            await this.loadSubcategories(subcategory);
        }
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['parent', 'subcategories', 'businesses'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async findBySlug(slug) {
        const category = await this.categoryRepository.findOne({
            where: { slug: (0, typeorm_2.ILike)(slug.trim()) },
            relations: ['parent', 'subcategories', 'businesses'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async getSubcategories(parentId) {
        const parent = await this.categoryRepository.findOne({
            where: { id: parentId },
        });
        if (!parent) {
            throw new common_1.NotFoundException('Parent category not found');
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
    async update(id, updateCategoryDto) {
        const category = await this.categoryRepository.findOne({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
            const slug = (0, slug_util_1.generateSlug)(updateCategoryDto.name);
            const existingCategory = await this.categoryRepository.findOne({
                where: { slug },
            });
            if (existingCategory && existingCategory.id !== id) {
                throw new common_1.ConflictException('Category with this name already exists');
            }
            updateCategoryDto['slug'] = slug;
        }
        if (updateCategoryDto.parentId) {
            if (updateCategoryDto.parentId === id) {
                throw new common_1.BadRequestException('Category cannot be its own parent');
            }
            const parentCategory = await this.categoryRepository.findOne({
                where: { id: updateCategoryDto.parentId },
            });
            if (!parentCategory) {
                throw new common_1.NotFoundException('Parent category not found');
            }
            const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
            if (isDescendant) {
                throw new common_1.BadRequestException('Cannot set a descendant category as parent (circular reference)');
            }
        }
        await this.categoryRepository.update(id, updateCategoryDto);
        return this.findOne(id);
    }
    async isDescendant(ancestorId, categoryId) {
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
    async remove(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['subcategories', 'businesses'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category.subcategories && category.subcategories.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with subcategories. Delete subcategories first.');
        }
        if (category.businesses && category.businesses.length > 0) {
            throw new common_1.BadRequestException('Cannot delete category with businesses. Reassign businesses first.');
        }
        await this.categoryRepository.remove(category);
    }
    async getPopularCategories(limit = 10) {
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map