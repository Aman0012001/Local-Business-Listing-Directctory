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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const parse_uuid_pipe_1 = require("../../common/pipes/parse-uuid.pipe");
const user_entity_1 = require("../../entities/user.entity");
let CategoriesController = class CategoriesController {
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    create(createCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }
    findAll(includeSubcategories) {
        return this.categoriesService.findAll(includeSubcategories);
    }
    getCategoryTree() {
        return this.categoriesService.getCategoryTree();
    }
    findRootCategories() {
        return this.categoriesService.findRootCategories();
    }
    getPopularCategories(limit) {
        return this.categoriesService.getPopularCategories(limit);
    }
    findBySlug(slug) {
        return this.categoriesService.findBySlug(slug);
    }
    findOne(id) {
        return this.categoriesService.findOne(id);
    }
    getSubcategories(id) {
        return this.categoriesService.getSubcategories(id);
    }
    update(id, updateCategoryDto) {
        return this.categoriesService.update(id, updateCategoryDto);
    }
    remove(id) {
        return this.categoriesService.remove(id);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new category (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Category created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Category already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories' }),
    (0, swagger_1.ApiQuery)({ name: 'includeSubcategories', required: false, type: Boolean }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __param(0, (0, common_1.Query)('includeSubcategories')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Get category tree (hierarchical structure)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category tree retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getCategoryTree", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('root'),
    (0, swagger_1.ApiOperation)({ summary: 'Get root categories (no parent)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Root categories retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findRootCategories", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('popular'),
    (0, swagger_1.ApiOperation)({ summary: 'Get popular categories by business count' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Popular categories retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getPopularCategories", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get category by slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findBySlug", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get category by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id/subcategories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get subcategories of a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Subcategories retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Parent category not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "getSubcategories", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update category (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete category (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Category deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete category with subcategories or businesses' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "remove", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('categories'),
    (0, common_1.Controller)('categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map