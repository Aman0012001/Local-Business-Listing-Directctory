export declare class CreateVendorDto {
    businessName: string;
    businessEmail?: string;
    businessPhone: string;
    businessAddress?: string;
    gstNumber?: string;
    ntnNumber?: string;
}
export declare class UpdateVendorDto {
    businessName?: string;
    businessEmail?: string;
    businessPhone?: string;
    businessAddress?: string;
    gstNumber?: string;
    ntnNumber?: string;
    businessHours?: Record<string, {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }>;
    socialLinks?: {
        platform: string;
        url: string;
    }[];
}
