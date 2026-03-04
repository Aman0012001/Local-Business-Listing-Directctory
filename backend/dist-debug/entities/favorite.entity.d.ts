import { User } from './user.entity';
import { Listing } from './business.entity';
export declare class SavedListing {
    userId: string;
    businessId: string;
    createdAt: Date;
    user: User;
    business: Listing;
}
