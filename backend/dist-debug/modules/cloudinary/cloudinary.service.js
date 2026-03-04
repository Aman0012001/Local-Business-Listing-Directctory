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
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
let CloudinaryService = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME')?.trim();
        const apiKey = this.configService.get('CLOUDINARY_API_KEY')?.trim();
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET')?.trim();
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });
        console.log('[CloudinaryService] ✅ Initialized:', {
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret_length: apiSecret?.length ?? 0,
            api_secret_preview: apiSecret
                ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`
                : 'MISSING ❌',
        });
    }
    async generateSignature() {
        const timestamp = Math.floor(Date.now() / 1000);
        const paramsToSign = { timestamp };
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET')?.trim();
        console.log('[CloudinaryService] 🔑 SECRET CHECK:', {
            api_secret_length: apiSecret?.length ?? 0,
            api_secret_preview: apiSecret
                ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`
                : 'MISSING ❌',
        });
        const signature = cloudinary_1.v2.utils.api_sign_request(paramsToSign, apiSecret);
        console.log('[CloudinaryService] ✍️ SIGNATURE GENERATED:', {
            timestamp,
            signature,
        });
        return {
            timestamp,
            signature,
            apiKey: this.configService.get('CLOUDINARY_API_KEY')?.trim(),
            cloudName: this.configService.get('CLOUDINARY_CLOUD_NAME')?.trim(),
        };
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map