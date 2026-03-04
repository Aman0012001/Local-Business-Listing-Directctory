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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const parse_uuid_pipe_1 = require("../../common/pipes/parse-uuid.pipe");
const user_entity_1 = require("../../entities/user.entity");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    getProfile(user) {
        return this.usersService.getProfile(user.id);
    }
    updateProfile(user, updateUserDto) {
        return this.usersService.updateProfile(user.id, updateUserDto);
    }
    async updateAvatar(user, avatarUrl) {
        const updatedUser = await this.usersService.updateAvatar(user.id, avatarUrl);
        return {
            success: true,
            message: 'Avatar updated successfully',
            user: updatedUser
        };
    }
    changePassword(user, changePasswordDto) {
        return this.usersService.changePassword(user.id, changePasswordDto);
    }
    getFavorites(user, page, limit) {
        return this.usersService.getFavorites(user.id, page, limit);
    }
    addFavorite(user, businessId) {
        return this.usersService.addFavorite(user.id, businessId);
    }
    removeFavorite(user, businessId) {
        return this.usersService.removeFavorite(user.id, businessId);
    }
    getNotifications(user, page, limit) {
        return this.usersService.getNotifications(user.id, page, limit);
    }
    markNotificationRead(user, id) {
        return this.usersService.markNotificationRead(user.id, id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)('profile/avatar'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user avatar URL' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                avatarUrl: {
                    type: 'string',
                    description: 'The Cloudinary URL of the uploaded avatar',
                },
            },
            required: ['avatarUrl'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Avatar updated successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)('avatarUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Patch)('password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Change current user password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('favorites'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user saved listings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Saved listings retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.Post)('favorites/:businessId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Add business to saved listings' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Added to saved listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('businessId', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addFavorite", null);
__decorate([
    (0, common_1.Delete)('favorites/:businessId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove business from saved listings' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Removed from saved listings' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('businessId', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeFavorite", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Patch)('notifications/:id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Notification marked as read' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "markNotificationRead", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map