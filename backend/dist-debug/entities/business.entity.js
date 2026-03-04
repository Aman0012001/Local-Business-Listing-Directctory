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
exports.Listing = exports.BusinessStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const vendor_entity_1 = require("./vendor.entity");
const category_entity_1 = require("./category.entity");
const business_hours_entity_1 = require("./business-hours.entity");
const business_amenity_entity_1 = require("./business-amenity.entity");
const review_entity_1 = require("./review.entity");
const lead_entity_1 = require("./lead.entity");
const favorite_entity_1 = require("./favorite.entity");
var BusinessStatus;
(function (BusinessStatus) {
    BusinessStatus["PENDING"] = "pending";
    BusinessStatus["APPROVED"] = "approved";
    BusinessStatus["REJECTED"] = "rejected";
    BusinessStatus["SUSPENDED"] = "suspended";
})(BusinessStatus || (exports.BusinessStatus = BusinessStatus = {}));
let Listing = class Listing {
    get name() {
        return this.title;
    }
    get businessName() {
        return this.title;
    }
};
exports.Listing = Listing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Listing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }),
    __metadata("design:type", String)
], Listing.prototype, "vendorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id', type: 'uuid' }),
    __metadata("design:type", String)
], Listing.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Listing.prototype, "name", null);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], Listing.prototype, "businessName", null);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Listing.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'short_description', nullable: true, length: 500 }),
    __metadata("design:type", String)
], Listing.prototype, "shortDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Listing.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], Listing.prototype, "whatsapp", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Listing.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'Pakistan', nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Listing.prototype, "pincode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Listing.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Listing.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cover_image_url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "coverImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Listing.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], Listing.prototype, "videos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'year_established', nullable: true }),
    __metadata("design:type", Number)
], Listing.prototype, "yearEstablished", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_count', nullable: true, length: 50 }),
    __metadata("design:type", String)
], Listing.prototype, "employeeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'price_range', nullable: true, length: 10 }),
    __metadata("design:type", String)
], Listing.prototype, "priceRange", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BusinessStatus,
        default: BusinessStatus.PENDING,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Listing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Listing.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_sponsored', default: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Boolean)
], Listing.prototype, "isSponsored", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Listing.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_reviews', default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "totalReviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_views', default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "totalViews", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_leads', default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "totalLeads", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_title', nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "metaTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_description', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "metaDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_keywords', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "metaKeywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Listing.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejected_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Listing.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'has_offer', default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "hasOffer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offer_title', nullable: true, length: 150 }),
    __metadata("design:type", String)
], Listing.prototype, "offerTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offer_description', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "offerDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offer_badge', nullable: true, length: 60 }),
    __metadata("design:type", String)
], Listing.prototype, "offerBadge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offer_expires_at', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Listing.prototype, "offerExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'offer_banner_url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Listing.prototype, "offerBannerUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Listing.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Listing.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => vendor_entity_1.Vendor, (vendor) => vendor.businesses),
    (0, typeorm_1.JoinColumn)({ name: 'vendor_id' }),
    __metadata("design:type", vendor_entity_1.Vendor)
], Listing.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.businesses),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Listing.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_hours_entity_1.BusinessHours, (hours) => hours.business),
    __metadata("design:type", Array)
], Listing.prototype, "businessHours", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => business_amenity_entity_1.BusinessAmenity, (amenity) => amenity.business),
    __metadata("design:type", Array)
], Listing.prototype, "businessAmenities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.business),
    __metadata("design:type", Array)
], Listing.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lead_entity_1.Lead, (lead) => lead.business),
    __metadata("design:type", Array)
], Listing.prototype, "leads", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => favorite_entity_1.SavedListing, (savedListing) => savedListing.business),
    __metadata("design:type", Array)
], Listing.prototype, "savedListings", void 0);
exports.Listing = Listing = __decorate([
    (0, typeorm_1.Entity)('businesses'),
    (0, typeorm_1.Index)(['latitude', 'longitude'])
], Listing);
//# sourceMappingURL=business.entity.js.map