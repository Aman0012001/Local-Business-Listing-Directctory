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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reviews_service_1 = require("./reviews.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const update_review_dto_1 = require("./dto/update-review.dto");
const vendor_response_dto_1 = require("./dto/vendor-response.dto");
const get_reviews_dto_1 = require("./dto/get-reviews.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const parse_uuid_pipe_1 = require("../../common/pipes/parse-uuid.pipe");
const user_entity_1 = require("../../entities/user.entity");
let ReviewsController = class ReviewsController {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    create(createReviewDto, user) {
        return this.reviewsService.create(createReviewDto, user);
    }
    findAll(getReviewsDto) {
        return this.reviewsService.findAll(getReviewsDto);
    }
    getBusinessRatingStats(idOrSlug) {
        return this.reviewsService.getBusinessRatingStats(idOrSlug);
    }
    findByBusiness(idOrSlug, getReviewsDto) {
        return this.reviewsService.findByBusiness(idOrSlug, getReviewsDto);
    }
    findOne(id) {
        return this.reviewsService.findOne(id);
    }
    update(id, updateReviewDto, user) {
        return this.reviewsService.update(id, updateReviewDto, user);
    }
    remove(id, user) {
        return this.reviewsService.remove(id, user);
    }
    addVendorResponse(id, vendorResponseDto, user) {
        return this.reviewsService.addVendorResponse(id, vendorResponseDto, user);
    }
    markAsHelpful(id, user) {
        return this.reviewsService.markAsHelpful(id, user);
    }
    removeHelpfulMark(id, user) {
        return this.reviewsService.removeHelpfulMark(id, user);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a review' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Review created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'You have already reviewed this business' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_1.CreateReviewDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get reviews with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reviews retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_reviews_dto_1.GetReviewsDto]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findAll", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('business/:idOrSlug/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business rating statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rating statistics retrieved' }),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "getBusinessRatingStats", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('business/:idOrSlug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get reviews by business ID or slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reviews retrieved successfully' }),
    __param(0, (0, common_1.Param)('idOrSlug')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_reviews_dto_1.GetReviewsDto]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findByBusiness", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get review by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Review not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update review (Owner or Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'You can only update your own reviews' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_dto_1.UpdateReviewDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete review (Owner or Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Review deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'You can only delete your own reviews' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/vendor-response'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add vendor response to review (Vendor only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vendor response added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only the business owner can respond' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vendor_response_dto_1.VendorResponseDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "addVendorResponse", null);
__decorate([
    (0, common_1.Post)(':id/helpful'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Mark review as helpful' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Review marked as helpful' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Already marked as helpful' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "markAsHelpful", null);
__decorate([
    (0, common_1.Delete)(':id/helpful'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.USER, user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove helpful mark from review' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Helpful mark removed' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "removeHelpfulMark", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('reviews'),
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map