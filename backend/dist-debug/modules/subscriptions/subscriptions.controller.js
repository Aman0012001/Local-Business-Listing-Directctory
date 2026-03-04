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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscriptions_service_1 = require("./subscriptions.service");
const subscription_dto_1 = require("./dto/subscription.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const user_entity_1 = require("../../entities/user.entity");
let SubscriptionsController = class SubscriptionsController {
    constructor(subService) {
        this.subService = subService;
    }
    getPlans() {
        return this.subService.getPlans();
    }
    createPlan(createPlanDto) {
        return this.subService.createPlan(createPlanDto);
    }
    createCheckout(user, checkoutDto) {
        return this.subService.createCheckoutSession(user.id, checkoutDto);
    }
    getActive(user) {
        return this.subService.getActiveSubscription(user.id);
    }
    getTransactions(user) {
        return this.subService.getTransactions(user.id);
    }
    async mockSuccess(user, planId) {
        const sub = await this.subService.getActiveSubscription(user.id);
        return this.subService.handleMockSubscriptionSuccess(user.vendor.id, planId, 'MOCK-SUB-' + Date.now());
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('plans'),
    (0, swagger_1.ApiOperation)({ summary: 'List all active subscription plans' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Plans retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new plan (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Plan created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_dto_1.CreatePlanDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Post)('checkout'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a checkout session' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Checkout session created' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, subscription_dto_1.CheckoutDto]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active subscription' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active subscription retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction history retrieved' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], SubscriptionsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('mock-success/:planId'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mock a payment success for development' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subscribed successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('planId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "mockSuccess", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, swagger_1.ApiTags)('subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map