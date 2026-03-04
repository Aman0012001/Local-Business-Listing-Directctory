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
exports.SubscriptionPlan = exports.SubscriptionPlanType = void 0;
const typeorm_1 = require("typeorm");
const subscription_entity_1 = require("./subscription.entity");
var SubscriptionPlanType;
(function (SubscriptionPlanType) {
    SubscriptionPlanType["FREE"] = "free";
    SubscriptionPlanType["BASIC"] = "basic";
    SubscriptionPlanType["PREMIUM"] = "premium";
    SubscriptionPlanType["ENTERPRISE"] = "enterprise";
})(SubscriptionPlanType || (exports.SubscriptionPlanType = SubscriptionPlanType = {}));
let SubscriptionPlan = class SubscriptionPlan {
};
exports.SubscriptionPlan = SubscriptionPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'plan_type',
        type: 'enum',
        enum: SubscriptionPlanType,
        unique: true,
    }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "planType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], SubscriptionPlan.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_cycle', length: 20, default: 'monthly' }),
    __metadata("design:type", String)
], SubscriptionPlan.prototype, "billingCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], SubscriptionPlan.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_listings', default: 1 }),
    __metadata("design:type", Number)
], SubscriptionPlan.prototype, "maxListings", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], SubscriptionPlan.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_sponsored', default: false }),
    __metadata("design:type", Boolean)
], SubscriptionPlan.prototype, "isSponsored", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'analytics_enabled', default: false }),
    __metadata("design:type", Boolean)
], SubscriptionPlan.prototype, "analyticsEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority_support', default: false }),
    __metadata("design:type", Boolean)
], SubscriptionPlan.prototype, "prioritySupport", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], SubscriptionPlan.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SubscriptionPlan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SubscriptionPlan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, (subscription) => subscription.plan),
    __metadata("design:type", Array)
], SubscriptionPlan.prototype, "subscriptions", void 0);
exports.SubscriptionPlan = SubscriptionPlan = __decorate([
    (0, typeorm_1.Entity)('subscription_plans')
], SubscriptionPlan);
//# sourceMappingURL=subscription-plan.entity.js.map