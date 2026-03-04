import { Review } from './review.entity';
import { User } from './user.entity';
export declare class ReviewHelpfulVote {
    reviewId: string;
    userId: string;
    createdAt: Date;
    review: Review;
    user: User;
}
