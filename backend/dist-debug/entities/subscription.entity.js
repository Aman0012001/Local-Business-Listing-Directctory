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
exports.Subscription = exports.SubscriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const vendor_entity_1 = require("./vendor.entity");
const subscription_plan_entity_1 = require("./subscription-plan.entity");
const transaction_entity_1 = require("./transaction.entity");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["SUSPENDED"] = "suspended";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
let Subscription = class Subscription {
};
exports.Subscription = Subscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Subscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Subscription.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Subscription.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_date', type: 'date' }),
    __metadata("design:type", Date)
], Subscription.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_date', type: 'date' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Subscription.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_renew', default: true }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Subscription.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: 'INR' }),
    __metadata("design:type", String)
], Subscription.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Subscription.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancellation_reason', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Subscription.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Subscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Subscription.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, (vendor) => vendor.subscriptions),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], Subscription.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_plan_entity_1.SubscriptionPlan, (plan) => plan.subscriptions),
    (0, typeorm_1.JoinColumn)({ name: 'plan_id' }),
    __metadata("design:type", subscription_plan_entity_1.SubscriptionPlan)
], Subscription.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.subscription),
    __metadata("design:type", Array)
], Subscription.prototype, "transactions", void 0);
exports.Subscription = Subscription = __decorate([
    (0, typeorm_1.Entity)('subscriptions')
], Subscription);
//# sourceMappingURL=subscription.entity.js.map