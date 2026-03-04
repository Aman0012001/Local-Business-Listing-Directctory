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
exports.ModerateReviewDto = exports.ModerateBusinessDto = exports.AdminAction = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const business_entity_1 = require("../../../entities/business.entity");
var AdminAction;
(function (AdminAction) {
    AdminAction["APPROVE"] = "approve";
    AdminAction["REJECT"] = "reject";
    AdminAction["SUSPEND"] = "suspend";
})(AdminAction || (exports.AdminAction = AdminAction = {}));
class ModerateBusinessDto {
}
exports.ModerateBusinessDto = ModerateBusinessDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: business_entity_1.BusinessStatus }),
    (0, class_validator_1.IsEnum)(business_entity_1.BusinessStatus),
    __metadata("design:type", String)
], ModerateBusinessDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Documents verified, all looks good.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ModerateBusinessDto.prototype, "reason", void 0);
class ModerateReviewDto {
}
exports.ModerateReviewDto = ModerateReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    __metadata("design:type", Boolean)
], ModerateReviewDto.prototype, "isApproved", void 0);
//# sourceMappingURL=moderate.dto.js.map