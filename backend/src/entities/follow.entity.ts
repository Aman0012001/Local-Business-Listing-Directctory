import {
    Entity,
    PrimaryColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';
import { Listing } from './business.entity';

@Entity('follows')
export class Follow {
    @PrimaryColumn({ name: 'user_id', type: 'uuid' })
    userId: string;

    @PrimaryColumn({ name: 'business_id', type: 'uuid' })
    businessId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @Exclude()
    @ManyToOne(() => User, (user) => user.follows)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Exclude()
    @ManyToOne(() => Listing, (listing) => listing.follows)
    @JoinColumn({ name: 'business_id' })
    business: Listing;
}
