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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutDto = exports.CreatePlanDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const subscription_plan_entity_1 = require("../../../entities/subscription-plan.entity");
class CreatePlanDto {
    constructor() {
        this.isFeatured = false;
        this.isSponsored = false;
    }
}
exports.CreatePlanDto = CreatePlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Premium Plan' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: subscription_plan_entity_1.SubscriptionPlanType, example: subscription_plan_entity_1.SubscriptionPlanType.PREMIUM }),
    (0, class_validator_1.IsEnum)(subscription_plan_entity_1.SubscriptionPlanType),
    __metadata("design:type", String)
], CreatePlanDto.prototype, "planType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 499.00 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePlanDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'monthly' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePlanDto.prototype, "billingCycle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Priority Support', 'Featured Listing', 'Extended Analytics'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePlanDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePlanDto.prototype, "maxListings", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePlanDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePlanDto.prototype, "isSponsored", void 0);
class CheckoutDto {
}
exports.CheckoutDto = CheckoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Plan UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'monthly' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "cycle", void 0);
//# sourceMappingURL=subscription.dto.js.map