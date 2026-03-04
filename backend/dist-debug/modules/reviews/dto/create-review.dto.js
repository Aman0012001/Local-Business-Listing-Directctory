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
exports.CreateReviewDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateReviewDto {
}
exports.CreateReviewDto = CreateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Business UUID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'Rating must be at least 1' }),
    (0, class_validator_1.Max)(5, { message: 'Rating must not exceed 5' }),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Excellent service!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Had a wonderful experience. Highly recommended!' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['https://example.com/img1.jpg'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateReviewDto.prototype, "images", void 0);
//# sourceMappingURL=create-review.dto.js.map