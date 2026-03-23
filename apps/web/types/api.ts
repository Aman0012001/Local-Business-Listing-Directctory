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
    country: string;
    description?: string;
    heroImageUrl?: string;
    imageUrl?: string;        // alias kept for backward compat
    isPopular: boolean;
    displayOrder: number;
    metaTitle?: string;
    metaDescription?: string;
    latitude?: number;
    longitude?: number;
    businessCount?: number;
    createdAt: string;
    updatedAt?: string;
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
            avatarUrl?: string;
            createdAt?: string;
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
    // Stats
    followersCount?: number;
    status: 'pending' | 'approved' | 'rejected' | 'disabled';
    faqs?: { question: string; answer: string }[];
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

export enum OfferType {
    OFFER = 'offer',
    EVENT = 'event',
}
export enum JobLeadStatus {
    OPEN = 'open',
    BROADCASTED = 'broadcasted',
    RESPONDED = 'responded',
    CLOSED = 'closed',
}

export interface OfferEvent {
    id: string;
    title: string;
    description: string;
    type: OfferType;
    offerBadge?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    expiryDate?: string;
    highlights?: string[];
    terms?: string[];
    businessId: string;
    business?: Business;
    createdAt: string;
}

export interface JobLead {
    id: string;
    userId: string;
    categoryId: string;
    category?: Category;
    title: string;
    description: string;
    city?: string;
    location?: string;
    budget?: number;
    status: JobLeadStatus;
    latitude?: number;
    longitude?: number;
    createdAt: string;
    responses?: JobLeadResponse[];
    hasResponded?: boolean;
}

export interface JobLeadResponse {
    id: string;
    jobLeadId: string;
    vendorId: string;
    vendor?: {
        id: string;
        businessName: string;
        user?: {
            fullName: string;
            avatarUrl?: string;
        }
    };
    message: string;
    price?: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}
