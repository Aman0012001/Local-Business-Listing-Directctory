import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

        // Only ONE cloudinary.config call in the entire codebase
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });

        // Print the FULL api_secret length and first/last 4 chars so mismatches are immediately obvious
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

        // Sign ONLY { timestamp } — do NOT add folder, preset, or anything else
        const paramsToSign = { timestamp };

        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

        // Log the RAW secret length and preview so the user can verify against their Cloudinary dashboard
        console.log('[CloudinaryService] 🔑 SECRET CHECK:', {
            api_secret_length: apiSecret?.length ?? 0,
            api_secret_preview: apiSecret
                ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`
                : 'MISSING ❌',
        });

        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

        console.log('[CloudinaryService] ✍️ SIGNATURE GENERATED:', {
            timestamp,
            signature,
        });

        return {
            timestamp,
            signature,
            apiKey: this.configService.get<string>('CLOUDINARY_API_KEY')?.trim(),
            cloudName: this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim(),
        };
    }
}
