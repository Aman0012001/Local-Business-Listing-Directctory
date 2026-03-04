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
exports.Transaction = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const subscription_entity_1 = require("./subscription.entity");
const vendor_entity_1 = require("./vendor.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
let Transaction = class Transaction {
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'subscription_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3, default: 'INR' }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_method', nullable: true, length: 50 }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_gateway', nullable: true, length: 50 }),
    __metadata("design:type", String)
], Transaction.prototype, "paymentGateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gateway_transaction_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "gatewayTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_number', nullable: true, unique: true, length: 50 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invoice_url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Transaction.prototype, "invoiceUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'jsonb' }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Transaction.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'failed_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Transaction.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refunded_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Transaction.prototype, "refundedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.Subscription, (subscription) => subscription.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'subscription_id' }),
    __metadata("design:type", subscription_entity_1.Subscription)
], Transaction.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, (vendor) => vendor.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], Transaction.prototype, "vendor", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map