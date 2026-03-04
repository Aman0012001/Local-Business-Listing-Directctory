import { Vendor } from './vendor.entity';
import { Category } from './category.entity';
import { BusinessHours } from './business-hours.entity';
import { BusinessAmenity } from './business-amenity.entity';
import { Review } from './review.entity';
import { Lead } from './lead.entity';
import { SavedListing } from './favorite.entity';
export declare enum BusinessStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare class Listing {
    id: string;
    vendorId: string;
    categoryId: string;
    title: string;
    get name(): string;
    get businessName(): string;
    slug: string;
    description: string;
    shortDescription: string;
    email: string;
    phone: string;
    whatsapp: string;
    website: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: number;
    longitude: number;
    logoUrl: string;
    coverImageUrl: string;
    images: string[];
    videos: string[];
    yearEstablished: number;
    employeeCount: string;
    priceRange: string;
    status: BusinessStatus;
    isVerified: boolean;
    isFeatured: boolean;
    isSponsored: boolean;
    averageRating: number;
    totalReviews: number;
    totalViews: number;
    totalLeads: number;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    approvedAt: Date;
    rejectedAt: Date;
    rejectionReason: string;
    hasOffer: boolean;
    offerTitle: string;
    offerDescription: string;
    offerBadge: string;
    offerExpiresAt: Date;
    offerBannerUrl: string;
    createdAt: Date;
    updatedAt: Date;
    vendor: Vendor;
    category: Category;
    businessHours: BusinessHours[];
    businessAmenities: BusinessAmenity[];
    reviews: Review[];
    leads: Lead[];
    savedListings: SavedListing[];
}
