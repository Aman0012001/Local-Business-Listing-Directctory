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
exports.Lead = exports.LeadStatus = exports.LeadType = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const business_entity_1 = require("./business.entity");
const user_entity_1 = require("./user.entity");
var LeadType;
(function (LeadType) {
    LeadType["CALL"] = "call";
    LeadType["WHATSAPP"] = "whatsapp";
    LeadType["EMAIL"] = "email";
    LeadType["CHAT"] = "chat";
    LeadType["WEBSITE"] = "website";
})(LeadType || (exports.LeadType = LeadType = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["CONVERTED"] = "converted";
    LeadStatus["LOST"] = "lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
let Lead = class Lead {
};
exports.Lead = Lead;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Lead.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true, type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadType,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: LeadStatus,
        default: LeadStatus.NEW,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lead.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], Lead.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Lead.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 50 }),
    __metadata("design:type", String)
], Lead.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Lead.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', nullable: true, type: 'inet' }),
    __metadata("design:type", String)
], Lead.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Lead.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacted_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Lead.prototype, "contactedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'converted_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Lead.prototype, "convertedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Lead.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_reply', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Lead.prototype, "vendorReply", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_replied_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Lead.prototype, "vendorRepliedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Lead.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Lead.prototype, "updatedAt", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Listing, (listing) => listing.leads),
    (0, typeorm_1.JoinColumn)({ name: 'business_id' }),
    __metadata("design:type", business_entity_1.Listing)
], Lead.prototype, "business", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.leads),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Lead.prototype, "user", void 0);
exports.Lead = Lead = __decorate([
    (0, typeorm_1.Entity)('leads')
], Lead);
//# sourceMappingURL=lead.entity.js.map