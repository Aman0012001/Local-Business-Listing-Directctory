import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';
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
    @ManyToOne(() => Business, (business) => business.businessAmenities)
    @JoinColumn({ name: 'business_id' })
    business: Business;

    @ManyToOne(() => Amenity, (amenity) => amenity.businessAmenities)
    @JoinColumn({ name: 'amenity_id' })
    amenity: Amenity;
}
