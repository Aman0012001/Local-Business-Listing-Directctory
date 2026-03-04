import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { ReviewHelpfulVote } from '../../entities/review-helpful-vote.entity';
import { Listing } from '../../entities/business.entity';
import { User } from '../../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
export declare class ReviewsService {
    private reviewRepository;
    private reviewHelpfulVoteRepository;
    private listingRepository;
    constructor(reviewRepository: Repository<Review>, reviewHelpfulVoteRepository: Repository<ReviewHelpfulVote>, listingRepository: Repository<Listing>);
    create(createReviewDto: CreateReviewDto, user: User): Promise<Review>;
    findAll(getReviewsDto: GetReviewsDto): Promise<import("../../common").PaginatedResponse<Review>>;
    findOne(id: string): Promise<Review>;
    update(id: string, updateReviewDto: UpdateReviewDto, user: User): Promise<Review>;
    remove(id: string, user: User): Promise<void>;
    addVendorResponse(id: string, vendorResponseDto: VendorResponseDto, user: User): Promise<Review>;
    markAsHelpful(reviewId: string, user: User): Promise<void>;
    removeHelpfulMark(reviewId: string, user: User): Promise<void>;
    getBusinessRatingStats(idOrSlug: string): Promise<{
        averageRating: any;
        totalReviews: any;
        ratingDistribution: {
            5: number;
            4: number;
            3: number;
            2: number;
            1: number;
        };
    }>;
    findByBusiness(idOrSlug: string, query: GetReviewsDto): Promise<import("../../common").PaginatedResponse<Review>>;
    private updateBusinessRating;
}
