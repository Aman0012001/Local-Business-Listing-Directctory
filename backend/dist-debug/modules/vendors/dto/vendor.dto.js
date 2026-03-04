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
exports.UpdateVendorDto = exports.CreateVendorDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const trimToUndefined = ({ value }) => typeof value === 'string' && value.trim() === '' ? undefined : value;
class CreateVendorDto {
}
exports.CreateVendorDto = CreateVendorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Awesome Shop' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'contact@mybusiness.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1234567890' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "businessPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123 Business Rd, Office 4B' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'GSTIN123456789' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "gstNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234567-8' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVendorDto.prototype, "ntnNumber", void 0);
class UpdateVendorDto {
}
exports.UpdateVendorDto = UpdateVendorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated Business Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "businessName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'newemail@business.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "businessEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+9876543210' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "businessPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'New Address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "businessAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'GSTIN123456789' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "gstNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1234567-8' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimToUndefined),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVendorDto.prototype, "ntnNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' } } }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateVendorDto.prototype, "businessHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: [{ platform: 'facebook', url: 'https://facebook.com/mybusiness' }] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateVendorDto.prototype, "socialLinks", void 0);
//# sourceMappingURL=vendor.dto.js.map