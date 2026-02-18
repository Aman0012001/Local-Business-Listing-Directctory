import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Business } from './business.entity';
import { User } from './user.entity';
import { ReviewHelpfulVote } from './review-helpful-vote.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'business_id', type: 'uuid' })
    @Index()
    businessId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column({ type: 'int' })
    @Index()
    rating: number;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true, type: 'text' })
    comment: string;

    @Column({ type: 'jsonb', default: '[]' })
    images: string[];

    @Column({ name: 'helpful_count', default: 0 })
    helpfulCount: number;

    @Column({ name: 'is_verified_purchase', default: false })
    isVerifiedPurchase: boolean;

    @Column({ name: 'is_approved', default: true })
    @Index()
    isApproved: boolean;

    @Column({ name: 'vendor_response', nullable: true, type: 'text' })
    vendorResponse: string;

    @Column({ name: 'vendor_response_at', nullable: true, type: 'timestamp' })
    vendorResponseAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Business, (business) => business.reviews)
    @JoinColumn({ name: 'business_id' })
    business: Business;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => ReviewHelpfulVote, (vote) => vote.review)
    helpfulVotes: ReviewHelpfulVote[];
}
