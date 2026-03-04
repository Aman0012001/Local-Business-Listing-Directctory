import { User } from './user.entity';
import { Listing } from './business.entity';
import { Subscription } from './subscription.entity';
import { Transaction } from './transaction.entity';
export declare class Vendor {
    id: string;
    userId: string;
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: string;
    gstNumber: string;
    ntnNumber: string;
    isVerified: boolean;
    verificationDocuments: Record<string, any>;
    businessHours: Record<string, {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    }>;
    socialLinks: {
        platform: string;
        url: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    user: User;
    businesses: Listing[];
    subscriptions: Subscription[];
    transactions: Transaction[];
}
