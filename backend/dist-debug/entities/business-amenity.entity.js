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
exports.BusinessAmenity = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const business_entity_1 = require("./business.entity");
const amenity_entity_1 = require("./amenity.entity");
let BusinessAmenity = class BusinessAmenity {
};
exports.BusinessAmenity = BusinessAmenity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'business_id', type: 'uuid' }),
    __metadata("design:type", String)
], BusinessAmenity.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'amenity_id', type: 'uuid' }),
    __metadata("design:type", String)
], BusinessAmenity.prototype, "amenityId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessAmenity.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Listing, (listing) => listing.businessAmenities),
    (0, typeorm_1.JoinColumn)({ name: 'business_id' }),
    __metadata("design:type", business_entity_1.Listing)
], BusinessAmenity.prototype, "business", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => amenity_entity_1.Amenity, (amenity) => amenity.businessAmenities),
    (0, typeorm_1.JoinColumn)({ name: 'amenity_id' }),
    __metadata("design:type", amenity_entity_1.Amenity)
], BusinessAmenity.prototype, "amenity", void 0);
exports.BusinessAmenity = BusinessAmenity = __decorate([
    (0, typeorm_1.Entity)('business_amenities')
], BusinessAmenity);
//# sourceMappingURL=business-amenity.entity.js.map