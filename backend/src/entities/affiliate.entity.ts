import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { User } from './user.entity';
import { AffiliateReferral } from './referral.entity';

export enum AffiliateStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
}

@Entity('affiliates')
export class Affiliate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    @Index({ unique: true })
    userId: string;

    @Column({ name: 'referral_code', unique: true })
    @Index()
    referralCode: string;

    @Column({ name: 'total_earnings', type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalEarnings: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    balance: number;

    @Column({
        type: 'enum',
        enum: AffiliateStatus,
        default: AffiliateStatus.ACTIVE,
    })
    status: AffiliateStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => AffiliateReferral, (referral) => referral.affiliate)
    referrals: AffiliateReferral[];
}
