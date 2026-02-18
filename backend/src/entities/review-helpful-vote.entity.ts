import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Review } from './review.entity';
import { User } from './user.entity';

@Entity('review_helpful_votes')
export class ReviewHelpfulVote {
    @PrimaryColumn({ name: 'review_id', type: 'uuid' })
    reviewId: string;

    @PrimaryColumn({ name: 'user_id', type: 'uuid' })
    userId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Review, (review) => review.helpfulVotes)
    @JoinColumn({ name: 'review_id' })
    review: Review;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
