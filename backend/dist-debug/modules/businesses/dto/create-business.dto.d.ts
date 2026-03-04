import { DayOfWeek } from '../../../entities/business-hours.entity';
export declare class BusinessHoursDto {
    dayOfWeek: DayOfWeek;
    isOpen?: boolean;
    openTime?: string;
    closeTime?: string;
}
export declare class CreateBusinessDto {
    title: string;
    categoryId: string;
    description: string;
    shortDescription?: string;
    email?: string;
    phone: string;
    whatsapp?: string;
    website?: string;
    address: string;
    city: string;
    state: string;
    country?: string;
    pincode: string;
    latitude: number;
    longitude: number;
    logoUrl?: string;
    coverImageUrl?: string;
    images?: string[];
    videos?: string[];
    yearEstablished?: number;
    employeeCount?: string;
    priceRange?: string;
    businessHours?: BusinessHoursDto[];
    amenityIds?: string[];
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    hasOffer?: boolean;
    offerTitle?: string;
    offerDescription?: string;
    offerBadge?: string;
    offerExpiresAt?: string;
    offerBannerUrl?: string;
}
