import { BusinessAmenity } from './business-amenity.entity';
export declare class Amenity {
    id: string;
    name: string;
    icon: string;
    createdAt: Date;
    businessAmenities: BusinessAmenity[];
}
