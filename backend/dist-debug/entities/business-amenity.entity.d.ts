import { Listing } from './business.entity';
import { Amenity } from './amenity.entity';
export declare class BusinessAmenity {
    businessId: string;
    amenityId: string;
    createdAt: Date;
    business: Listing;
    amenity: Amenity;
}
