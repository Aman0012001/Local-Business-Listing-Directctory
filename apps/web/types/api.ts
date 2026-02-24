export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    iconUrl?: string;
    parentId?: string;
    displayOrder?: number;
    businessCount?: number;
    subcategories?: Category[];
}

export interface City {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    businessCount?: number;
}

export interface Business {
    id: string;
    name: string;
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
    category?: Category;
    website?: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    user: {
        firstName: string;
        lastName: string;
    };
    vendorResponse?: string;
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
