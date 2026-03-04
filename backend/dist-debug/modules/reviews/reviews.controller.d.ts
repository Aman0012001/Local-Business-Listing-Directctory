import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { User } from '../../entities/user.entity';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(createReviewDto: CreateReviewDto, user: User): Promise<import("../../entities").Review>;
    findAll(getReviewsDto: GetReviewsDto): Promise<import("../../common").PaginatedResponse<import("../../entities").Review>>;
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
    findByBusiness(idOrSlug: string, getReviewsDto: GetReviewsDto): Promise<import("../../common").PaginatedResponse<import("../../entities").Review>>;
    findOne(id: string): Promise<import("../../entities").Review>;
    update(id: string, updateReviewDto: UpdateReviewDto, user: User): Promise<import("../../entities").Review>;
    remove(id: string, user: User): Promise<void>;
    addVendorResponse(id: string, vendorResponseDto: VendorResponseDto, user: User): Promise<import("../../entities").Review>;
    markAsHelpful(id: string, user: User): Promise<void>;
    removeHelpfulMark(id: string, user: User): Promise<void>;
}
