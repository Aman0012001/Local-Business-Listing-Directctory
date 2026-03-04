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
exports.Vendor = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("./user.entity");
const business_entity_1 = require("./business.entity");
const subscription_entity_1 = require("./subscription.entity");
const transaction_entity_1 = require("./transaction.entity");
let Vendor = class Vendor {
};
exports.Vendor = Vendor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Vendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], Vendor.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_name', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_email', nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "businessEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_phone', length: 20, nullable: true }),
    __metadata("design:type", String)
], Vendor.prototype, "businessPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_address', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Vendor.prototype, "businessAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gst_number', nullable: true, length: 15 }),
    __metadata("design:type", String)
], Vendor.prototype, "gstNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ntn_number', nullable: true, length: 15 }),
    __metadata("design:type", String)
], Vendor.prototype, "ntnNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], Vendor.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verification_documents', nullable: true, type: 'jsonb' }),
    __metadata("design:type", Object)
], Vendor.prototype, "verificationDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_hours', nullable: true, type: 'jsonb' }),
    __metadata("design:type", Object)
], Vendor.prototype, "businessHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'social_links', nullable: true, type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Vendor.prototype, "socialLinks", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Vendor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Vendor.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.vendor),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Vendor.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.OneToMany)(() => business_entity_1.Listing, (listing) => listing.vendor),
    __metadata("design:type", Array)
], Vendor.prototype, "businesses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, (subscription) => subscription.vendor),
    __metadata("design:type", Array)
], Vendor.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.vendor),
    __metadata("design:type", Array)
], Vendor.prototype, "transactions", void 0);
exports.Vendor = Vendor = __decorate([
    (0, typeorm_1.Entity)('vendors')
], Vendor);
//# sourceMappingURL=vendor.entity.js.map