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
exports.CloudinaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const cloudinary_service_1 = require("./cloudinary.service");
let CloudinaryController = class CloudinaryController {
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async getSignature() {
        return this.cloudinaryService.generateSignature();
    }
};
exports.CloudinaryController = CloudinaryController;
__decorate([
    (0, common_1.Post)('sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate Cloudinary upload signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Signature generated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CloudinaryController.prototype, "getSignature", null);
exports.CloudinaryController = CloudinaryController = __decorate([
    (0, swagger_1.ApiTags)('cloudinary'),
    (0, common_1.Controller)('cloudinary'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], CloudinaryController);
//# sourceMappingURL=cloudinary.controller.js.map