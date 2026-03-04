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
exports.GetLeadsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
const lead_entity_1 = require("../../../entities/lead.entity");
class GetLeadsDto extends pagination_dto_1.PaginationDto {
}
exports.GetLeadsDto = GetLeadsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by business UUID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetLeadsDto.prototype, "businessId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: lead_entity_1.LeadType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(lead_entity_1.LeadType),
    __metadata("design:type", String)
], GetLeadsDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: lead_entity_1.LeadStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(lead_entity_1.LeadStatus),
    __metadata("design:type", String)
], GetLeadsDto.prototype, "status", void 0);
//# sourceMappingURL=get-leads.dto.js.map