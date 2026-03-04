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
exports.CreateBusinessDto = exports.BusinessHoursDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const business_hours_entity_1 = require("../../../entities/business-hours.entity");
class BusinessHoursDto {
    constructor() {
        this.isOpen = true;
    }
}
exports.BusinessHoursDto = BusinessHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_hours_entity_1.DayOfWeek }),
    (0, class_validator_1.IsEnum)(business_hours_entity_1.DayOfWeek),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BusinessHoursDto.prototype, "isOpen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '09:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "openTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '18:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' }),
    __metadata("design:type", String)
], BusinessHoursDto.prototype, "closeTime", void 0);
class CreateBusinessDto {
    constructor() {
        this.country = 'Pakistan';
    }
}
exports.CreateBusinessDto = CreateBusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Best Restaurant' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'A wonderful dining experience...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Great food and ambiance', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'contact@restaurant.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number' }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid WhatsApp number' }),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "whatsapp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://restaurant.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main Street, Downtown' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New York' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pakistan', default: 'Pakistan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40.7128, description: 'Latitude' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], CreateBusinessDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: -74.0060, description: 'Longitude' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], CreateBusinessDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/logo.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/cover.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "coverImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['https://example.com/img1.jpg'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateBusinessDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateBusinessDto.prototype, "videos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2010 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1800),
    (0, class_validator_1.Max)(new Date().getFullYear()),
    __metadata("design:type", Number)
], CreateBusinessDto.prototype, "yearEstablished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '10-50' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "employeeCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '$$', enum: ['$', '$$', '$$$', '$$$$'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "priceRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [BusinessHoursDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BusinessHoursDto),
    __metadata("design:type", Array)
], CreateBusinessDto.prototype, "businessHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Array of amenity UUIDs' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateBusinessDto.prototype, "amenityIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Best Restaurant in NYC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "metaTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Find the best dining experience...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'restaurant, dining, food, nyc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "metaKeywords", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateBusinessDto.prototype, "hasOffer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Grand Opening Sale' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "offerTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Get 30% off on all services this week!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "offerDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '30% OFF' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "offerBadge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2025-12-31' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "offerExpiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/banner.jpg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessDto.prototype, "offerBannerUrl", void 0);
//# sourceMappingURL=create-business.dto.js.map