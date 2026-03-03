import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';
import { Listing } from './business.entity';

@Entity('favorites')
export class SavedListing {
    @PrimaryColumn({ name: 'user_id', type: 'uuid' })
    userId: string;

    @PrimaryColumn({ name: 'business_id', type: 'uuid' })
    businessId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.savedListings)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Exclude()
    @ManyToOne(() => Listing, (listing) => listing.savedListings)
    @JoinColumn({ name: 'business_id' })
    business: Listing;
}
