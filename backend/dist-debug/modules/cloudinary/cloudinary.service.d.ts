import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    generateSignature(): Promise<{
        timestamp: number;
        signature: string;
        apiKey: string;
        cloudName: string;
    }>;
}
