import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';
import { Listing } from './business.entity';
import { AffiliateReferral } from './referral.entity';

@Entity('business_check_ins')
export class BusinessCheckIn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({ name: 'business_id' })
    @Index()
    businessId: string;

    @Column({ name: 'referral_id', nullable: true })
    @Index()
    referralId: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @CreateDateColumn({ name: 'visited_at' })
    visitedAt: Date;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Listing)
    @JoinColumn({ name: 'business_id' })
    business: Listing;

    @ManyToOne(() => AffiliateReferral)
    @JoinColumn({ name: 'referral_id' })
    referral: AffiliateReferral;
}
