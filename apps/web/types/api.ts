export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    imageUrl?: string;
    parentId?: string;
    displayOrder: number;
    status: 'active' | 'disabled';
    source: 'google' | 'admin';
    businessCount?: number;
    subcategories?: Category[];
    createdAt: string;
}

export interface City {
    id: string;
    name: string;
    slug: string;
    state?: string;
    country?: string;
    imageUrl?: string;
    businessCount?: number;
}

export interface BusinessHours {
    id: string;
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    openTime: string;
    closeTime: string;
    isOpen: boolean;
}

export interface Amenity {
    id: string;
    name: string;
    icon?: string;
}

export interface BusinessAmenity {
    id: string;
    amenity: Amenity;
}

export interface Business {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    logoUrl?: string;
    coverImageUrl?: string;
    images: string[];
    averageRating: number;
    totalReviews: number;
    priceRange?: string;
    isVerified: boolean;
    isFeatured: boolean;
    whatsapp?: string;
    category?: Category;
    website?: string;
    businessHours?: BusinessHours[];
    businessAmenities?: BusinessAmenity[];
    vendorId?: string;
    vendor?: {
        id: string;
        userId?: string;
        user?: { 
            id: string; 
            fullName?: string; 
            email?: string;
            isOnline?: boolean;
            lastLoginAt?: string;
            lastActiveAt?: string;
            lastLogoutAt?: string;
        };
        businessHours?: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
        socialLinks?: { platform: string; url: string; }[];
    };
    // SEO / Search
    metaKeywords?: string;
    // Offer / Promo
    hasOffer?: boolean;
    offerTitle?: string;
    offerDescription?: string;
    offerBadge?: string;
    offerExpiresAt?: string;
    offerBannerUrl?: string;
    status: 'pending' | 'approved' | 'rejected' | 'disabled';
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    user: {
        fullName: string;
        avatarUrl?: string;
    };
    business?: {
        id: string;
        name?: string;
        title?: string;
        slug: string;
        coverImageUrl?: string;
    };
    vendorResponse?: string;
    vendorResponseAt?: string;
    createdAt: string;
}

export interface SearchResponse {
    data: Business[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasMore: boolean;
    };
}
