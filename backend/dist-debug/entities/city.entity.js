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
exports.City = void 0;
const typeorm_1 = require("typeorm");
let City = class City {
};
exports.City = City;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], City.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], City.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], City.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], City.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, default: 'Pakistan', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], City.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], City.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hero_image_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], City.prototype, "heroImageUrl", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'is_popular', default: false }),
    __metadata("design:type", Boolean)
], City.prototype, "isPopular", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', default: 0 }),
    __metadata("design:type", Number)
], City.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_title', length: 255, nullable: true }),
    __metadata("design:type", String)
], City.prototype, "metaTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], City.prototype, "metaDescription", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], City.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], City.prototype, "updatedAt", void 0);
exports.City = City = __decorate([
    (0, typeorm_1.Entity)('cities')
], City);
//# sourceMappingURL=city.entity.js.map