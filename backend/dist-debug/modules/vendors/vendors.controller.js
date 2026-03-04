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
exports.VendorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vendors_service_1 = require("./vendors.service");
const businesses_service_1 = require("../businesses/businesses.service");
const vendor_dto_1 = require("./dto/vendor.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../entities/user.entity");
let VendorsController = class VendorsController {
    constructor(vendorsService, businessesService) {
        this.vendorsService = vendorsService;
        this.businessesService = businessesService;
    }
    getByCity(city) {
        return this.vendorsService.getByCity(city || '');
    }
    becomeVendor(user, createVendorDto) {
        return this.vendorsService.becomeVendor(user.id, createVendorDto);
    }
    getMyListings(user) {
        return this.businessesService.getVendorBusinesses(user.id);
    }
    getProfile(user) {
        return this.vendorsService.getProfile(user.id);
    }
    updateProfile(user, updateVendorDto) {
        return this.vendorsService.updateProfile(user.id, updateVendorDto);
    }
    getStats(user) {
        return this.vendorsService.getDashboardStats(user.id);
    }
    submitVerification(user, documents) {
        return this.vendorsService.submitVerification(user.id, documents);
    }
};
exports.VendorsController = VendorsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('by-city'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get public vendor profiles in a given city (no auth required)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor profiles retrieved' }),
    __param(0, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getByCity", null);
__decorate([
    (0, common_1.Post)('become-vendor'),
    (0, swagger_1.ApiOperation)({ summary: 'Register the current user as a vendor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vendor profile created' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, vendor_dto_1.CreateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "becomeVendor", null);
__decorate([
    (0, common_1.Get)('my-listings'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR),
    (0, swagger_1.ApiOperation)({ summary: 'Get current vendor listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getMyListings", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current vendor profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update current vendor profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, vendor_dto_1.UpdateVendorDto]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('dashboard-stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get overview stats for the vendor dashboard' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Submit verification documents' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documents submitted' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", void 0)
], VendorsController.prototype, "submitVerification", null);
exports.VendorsController = VendorsController = __decorate([
    (0, swagger_1.ApiTags)('vendors'),
    (0, common_1.Controller)('vendors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService,
        businesses_service_1.BusinessesService])
], VendorsController);
//# sourceMappingURL=vendors.controller.js.map