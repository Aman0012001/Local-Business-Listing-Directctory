import { Listing } from './business.entity';
import { User } from './user.entity';
import { ReviewHelpfulVote } from './review-helpful-vote.entity';
export declare class Review {
    id: string;
    businessId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
    images: string[];
    helpfulCount: number;
    isVerifiedPurchase: boolean;
    isApproved: boolean;
    vendorResponse: string;
    vendorResponseAt: Date;
    createdAt: Date;
    updatedAt: Date;
    business: Listing;
    user: User;
    helpfulVotes: ReviewHelpfulVote[];
}
