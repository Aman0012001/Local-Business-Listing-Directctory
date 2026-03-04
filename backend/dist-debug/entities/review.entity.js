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
exports.Review = void 0;
const typeorm_1 = require("typeorm");
const business_entity_1 = require("./business.entity");
const user_entity_1 = require("./user.entity");
const review_helpful_vote_entity_1 = require("./review-helpful-vote.entity");
let Review = class Review {
};
exports.Review = Review;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Review.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Review.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Review.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Review.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Review.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Review.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'helpful_count', default: 0 }),
    __metadata("design:type", Number)
], Review.prototype, "helpfulCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified_purchase', default: false }),
    __metadata("design:type", Boolean)
], Review.prototype, "isVerifiedPurchase", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_approved', default: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Review.prototype, "isApproved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_response', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Review.prototype, "vendorResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_response_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Review.prototype, "vendorResponseAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Review.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Review.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Listing, (listing) => listing.reviews),
    (0, typeorm_1.JoinColumn)({ name: 'business_id' }),
    __metadata("design:type", business_entity_1.Listing)
], Review.prototype, "business", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.reviews),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Review.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_helpful_vote_entity_1.ReviewHelpfulVote, (vote) => vote.review),
    __metadata("design:type", Array)
], Review.prototype, "helpfulVotes", void 0);
exports.Review = Review = __decorate([
    (0, typeorm_1.Entity)('reviews')
], Review);
//# sourceMappingURL=review.entity.js.map