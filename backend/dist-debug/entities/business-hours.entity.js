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
exports.BusinessHours = exports.DayOfWeek = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const business_entity_1 = require("./business.entity");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "monday";
    DayOfWeek["TUESDAY"] = "tuesday";
    DayOfWeek["WEDNESDAY"] = "wednesday";
    DayOfWeek["THURSDAY"] = "thursday";
    DayOfWeek["FRIDAY"] = "friday";
    DayOfWeek["SATURDAY"] = "saturday";
    DayOfWeek["SUNDAY"] = "sunday";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
let BusinessHours = class BusinessHours {
};
exports.BusinessHours = BusinessHours;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BusinessHours.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_id', type: 'uuid' }),
    __metadata("design:type", String)
], BusinessHours.prototype, "businessId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'day_of_week',
        type: 'enum',
        enum: DayOfWeek,
    }),
    __metadata("design:type", String)
], BusinessHours.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_open', default: true }),
    __metadata("design:type", Boolean)
], BusinessHours.prototype, "isOpen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'open_time', nullable: true, type: 'time' }),
    __metadata("design:type", String)
], BusinessHours.prototype, "openTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'close_time', nullable: true, type: 'time' }),
    __metadata("design:type", String)
], BusinessHours.prototype, "closeTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BusinessHours.prototype, "createdAt", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.ManyToOne)(() => business_entity_1.Listing, (listing) => listing.businessHours),
    (0, typeorm_1.JoinColumn)({ name: 'business_id' }),
    __metadata("design:type", business_entity_1.Listing)
], BusinessHours.prototype, "business", void 0);
exports.BusinessHours = BusinessHours = __decorate([
    (0, typeorm_1.Entity)('business_hours')
], BusinessHours);
//# sourceMappingURL=business-hours.entity.js.map