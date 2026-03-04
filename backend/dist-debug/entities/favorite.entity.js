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
exports.SavedListing = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("./user.entity");
const business_entity_1 = require("./business.entity");
let SavedListing = class SavedListing {
};
exports.SavedListing = SavedListing;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], SavedListing.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'business_id', type: 'uuid' }),
    __metadata("design:type", String)
], SavedListing.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SavedListing.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.savedListings),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], SavedListing.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Listing, (listing) => listing.savedListings),
    (0, typeorm_1.JoinColumn)({ name: 'business_id' }),
    __metadata("design:type", business_entity_1.Listing)
], SavedListing.prototype, "business", void 0);
exports.SavedListing = SavedListing = __decorate([
    (0, typeorm_1.Entity)('favorites')
], SavedListing);
//# sourceMappingURL=favorite.entity.js.map