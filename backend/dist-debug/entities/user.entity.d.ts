import { Vendor } from './vendor.entity';
import { Review } from './review.entity';
import { Lead } from './lead.entity';
import { SavedListing } from './favorite.entity';
import { Notification } from './notification.entity';
export declare enum UserRole {
    USER = "user",
    VENDOR = "vendor",
    ADMIN = "admin",
    SUPERADMIN = "superadmin"
}
export declare class User {
    id: string;
    password: string;
    email: string;
    phone: string;
    fullName: string;
    avatarUrl: string;
    role: UserRole;
    isActive: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    city: string;
    state: string;
    country: string;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    vendor: Vendor;
    reviews: Review[];
    leads: Lead[];
    savedListings: SavedListing[];
    notifications: Notification[];
}
