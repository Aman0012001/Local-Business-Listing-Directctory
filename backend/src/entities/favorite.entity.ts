import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Business } from './business.entity';

@Entity('favorites')
export class Favorite {
    @PrimaryColumn({ name: 'user_id', type: 'uuid' })
    userId: string;

    @PrimaryColumn({ name: 'business_id', type: 'uuid' })
    businessId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.favorites)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Business, (business) => business.favorites)
    @JoinColumn({ name: 'business_id' })
    business: Business;
}
