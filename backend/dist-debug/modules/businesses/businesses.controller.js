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
exports.BusinessesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const businesses_service_1 = require("./businesses.service");
const create_business_dto_1 = require("./dto/create-business.dto");
const update_business_dto_1 = require("./dto/update-business.dto");
const search_business_dto_1 = require("./dto/search-business.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const optional_jwt_auth_guard_1 = require("../../common/guards/optional-jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const parse_uuid_pipe_1 = require("../../common/pipes/parse-uuid.pipe");
const user_entity_1 = require("../../entities/user.entity");
let BusinessesController = class BusinessesController {
    constructor(businessesService) {
        this.businessesService = businessesService;
    }
    create(createBusinessDto, user) {
        return this.businessesService.create(createBusinessDto, user);
    }
    async updateImageUrl(id, imageUrl, user) {
        return this.businessesService.updateImage(id, imageUrl, user);
    }
    search(searchDto) {
        return this.businessesService.search(searchDto);
    }
    findBySlug(slug, user) {
        return this.businessesService.findBySlug(slug, user?.id);
    }
    findOne(id, user) {
        return this.businessesService.findOne(id, user?.id);
    }
    update(id, updateBusinessDto, user) {
        return this.businessesService.update(id, updateBusinessDto, user);
    }
    remove(id, user) {
        return this.businessesService.remove(id, user);
    }
    getMyBusinesses(user, page, limit) {
        return this.businessesService.getVendorBusinesses(user.id, page, limit);
    }
    getSimilar(idOrSlug, limit) {
        return this.businessesService.getSimilar(idOrSlug, limit);
    }
    getAllAmenities() {
        return this.businessesService.getAllAmenities();
    }
    createAmenity(data) {
        return this.businessesService.createAmenity(data.name, data.icon);
    }
};
exports.BusinessesController = BusinessesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new listing (Vendor only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Listing created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only vendors can create listings' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_business_dto_1.CreateBusinessDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/image'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update business listing image URL' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                imageUrl: {
                    type: 'string',
                    description: 'The Cloudinary URL of the uploaded image',
                },
            },
            required: ['imageUrl'],
        },
    }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)('imageUrl')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], BusinessesController.prototype, "updateImageUrl", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search listings with filters and geo-location' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results returned' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_business_dto_1.SearchBusinessDto]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "search", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get listing by slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get listing by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update listing (Owner or Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_business_dto_1.UpdateBusinessDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete listing (Owner or Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Listing deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Unauthorized access' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('vendor/my-listings'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current vendor listings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor listings retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getMyBusinesses", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':idOrSlug/similar'),
    (0, swagger_1.ApiOperation)({ summary: 'Get similar listings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Similar listings retrieved' }),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getSimilar", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('amenities/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all available amenities' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "getAllAmenities", null);
__decorate([
    (0, common_1.Post)('amenities'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new amenity' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessesController.prototype, "createAmenity", null);
exports.BusinessesController = BusinessesController = __decorate([
    (0, swagger_1.ApiTags)('businesses'),
    (0, common_1.Controller)('businesses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [businesses_service_1.BusinessesService])
], BusinessesController);
//# sourceMappingURL=businesses.controller.js.map