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
exports.SearchBusinessDto = exports.SearchSortBy = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
var SearchSortBy;
(function (SearchSortBy) {
    SearchSortBy["RELEVANCE"] = "relevance";
    SearchSortBy["DISTANCE"] = "distance";
    SearchSortBy["RATING"] = "rating";
    SearchSortBy["NEWEST"] = "newest";
})(SearchSortBy || (exports.SearchSortBy = SearchSortBy = {}));
class SearchBusinessDto extends pagination_dto_1.PaginationDto {
    constructor() {
        super(...arguments);
        this.radius = 10;
        this.openNow = false;
        this.featuredOnly = false;
        this.verifiedOnly = false;
        this.sortBy = SearchSortBy.RELEVANCE;
    }
}
exports.SearchBusinessDto = SearchBusinessDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'restaurant' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchBusinessDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40.7128, description: 'User latitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    __metadata("design:type", Number)
], SearchBusinessDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: -74.0060, description: 'User longitude' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], SearchBusinessDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Search radius in kilometers', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchBusinessDto.prototype, "radius", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SearchBusinessDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'New York' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchBusinessDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'restaurants' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchBusinessDto.prototype, "categorySlug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4, minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], SearchBusinessDto.prototype, "minRating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '$$', enum: ['$', '$$', '$$$', '$$$$'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchBusinessDto.prototype, "priceRange", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchBusinessDto.prototype, "openNow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchBusinessDto.prototype, "featuredOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchBusinessDto.prototype, "verifiedOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SearchSortBy, default: SearchSortBy.RELEVANCE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SearchSortBy),
    __metadata("design:type", String)
], SearchBusinessDto.prototype, "sortBy", void 0);
//# sourceMappingURL=search-business.dto.js.map