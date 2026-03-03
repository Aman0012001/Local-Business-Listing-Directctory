import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Listing } from './business.entity';
import { Amenity } from './amenity.entity';

@Entity('business_amenities')
export class BusinessAmenity {
    @PrimaryColumn({ name: 'business_id', type: 'uuid' })
    businessId: string;

    @PrimaryColumn({ name: 'amenity_id', type: 'uuid' })
    amenityId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @Exclude()
    @ManyToOne(() => Listing, (listing) => listing.businessAmenities)
    @JoinColumn({ name: 'business_id' })
    business: Listing;

    @ManyToOne(() => Amenity, (amenity) => amenity.businessAmenities)
    @JoinColumn({ name: 'amenity_id' })
    amenity: Amenity;
}
