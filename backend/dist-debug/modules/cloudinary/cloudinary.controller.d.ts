import { CloudinaryService } from './cloudinary.service';
export declare class CloudinaryController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    getSignature(): Promise<{
        timestamp: number;
        signature: string;
        apiKey: string;
        cloudName: string;
    }>;
}
