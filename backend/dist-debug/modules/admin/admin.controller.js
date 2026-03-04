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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const moderate_dto_1 = require("./dto/moderate.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_entity_1 = require("../../entities/user.entity");
const parse_uuid_pipe_1 = require("../../common/pipes/parse-uuid.pipe");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    getStats() {
        return this.adminService.getGlobalStats();
    }
    moderateBusiness(id, dto) {
        return this.adminService.moderateBusiness(id, dto);
    }
    moderateReview(id, dto) {
        return this.adminService.moderateReview(id, dto);
    }
    verifyVendor(id, status) {
        return this.adminService.verifyVendor(id, status === 'true');
    }
    getUsers(page, limit) {
        return this.adminService.getAllUsers(page, limit);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global site statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)('business/:id/moderate'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve, reject, or suspend a business' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Business status updated' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, moderate_dto_1.ModerateBusinessDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "moderateBusiness", null);
__decorate([
    (0, common_1.Patch)('review/:id/moderate'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve or hide a review' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review status updated' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, moderate_dto_1.ModerateReviewDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "moderateReview", null);
__decorate([
    (0, common_1.Post)('vendor/:id/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify or unverify a vendor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor verification updated' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "verifyVendor", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all user records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Full user list retrieved' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map