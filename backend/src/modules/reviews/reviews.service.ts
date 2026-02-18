import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { ReviewHelpfulVote } from '../../entities/review-helpful-vote.entity';
import { Business } from '../../entities/business.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import {
    createPaginatedResponse,
    calculateSkip,
} from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
        @InjectRepository(ReviewHelpfulVote)
        private reviewHelpfulVoteRepository: Repository<ReviewHelpfulVote>,
        @InjectRepository(Business)
        private businessRepository: Repository<Business>,
    ) { }

    /**
     * Create a new review
     */
    async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
        const { businessId } = createReviewDto;

        // Verify business exists
        const business = await this.businessRepository.findOne({
            where: { id: businessId },
        });

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Check if user already reviewed this business
        const existingReview = await this.reviewRepository.findOne({
            where: {
                businessId,
                userId: user.id,
            },
        });

        if (existingReview) {
            throw new ConflictException('You have already reviewed this business');
        }

        // Create review
        const review = this.reviewRepository.create({
            ...createReviewDto,
            userId: user.id,
            isApproved: true, // Auto-approve for now
        });

        const savedReview = await this.reviewRepository.save(review);

        // Update business rating
        await this.updateBusinessRating(businessId);

        return this.findOne(savedReview.id);
    }

    /**
     * Get reviews with filters
     */
    async findAll(getReviewsDto: GetReviewsDto) {
        const { page = 1, limit = 20, businessId, userId, rating } = getReviewsDto;
        const skip = calculateSkip(page, limit);

        const queryBuilder = this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.business', 'business')
            .where('review.isApproved = :isApproved', { isApproved: true });

        // Filter by business
        if (businessId) {
            queryBuilder.andWhere('review.businessId = :businessId', { businessId });
        }

        // Filter by user
        if (userId) {
            queryBuilder.andWhere('review.userId = :userId', { userId });
        }

        // Filter by rating
        if (rating) {
            queryBuilder.andWhere('review.rating = :rating', { rating });
        }

        // Order by newest first
        queryBuilder.orderBy('review.createdAt', 'DESC');

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const reviews = await queryBuilder.skip(skip).take(limit).getMany();

        return createPaginatedResponse(reviews, page, limit, total);
    }

    /**
     * Get review by ID
     */
    async findOne(id: string): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user', 'business', 'helpfulVotes'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        return review;
    }

    /**
     * Update review
     */
    async update(
        id: string,
        updateReviewDto: UpdateReviewDto,
        user: User,
    ): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Check ownership
        if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only update your own reviews');
        }

        // Update review
        await this.reviewRepository.update(id, updateReviewDto);

        // Update business rating if rating changed
        if (updateReviewDto.rating && updateReviewDto.rating !== review.rating) {
            await this.updateBusinessRating(review.businessId);
        }

        return this.findOne(id);
    }

    /**
     * Delete review
     */
    async remove(id: string, user: User): Promise<void> {
        const review = await this.reviewRepository.findOne({
            where: { id },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Check ownership
        if (review.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only delete your own reviews');
        }

        const businessId = review.businessId;

        await this.reviewRepository.remove(review);

        // Update business rating
        await this.updateBusinessRating(businessId);
    }

    /**
     * Add vendor response to review
     */
    async addVendorResponse(
        id: string,
        vendorResponseDto: VendorResponseDto,
        user: User,
    ): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['business', 'business.vendor'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Check if user is the vendor of this business
        if (
            review.business.vendor.userId !== user.id &&
            user.role !== UserRole.ADMIN
        ) {
            throw new ForbiddenException('Only the business owner can respond to reviews');
        }

        // Update review with vendor response
        review.vendorResponse = vendorResponseDto.response;
        review.vendorResponseAt = new Date();

        await this.reviewRepository.save(review);

        return this.findOne(id);
    }

    /**
     * Mark review as helpful
     */
    async markAsHelpful(reviewId: string, user: User): Promise<void> {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // Check if user already marked as helpful
        const existingVote = await this.reviewHelpfulVoteRepository.findOne({
            where: {
                reviewId,
                userId: user.id,
            },
        });

        if (existingVote) {
            throw new ConflictException('You have already marked this review as helpful');
        }

        // Create helpful vote
        const vote = this.reviewHelpfulVoteRepository.create({
            reviewId,
            userId: user.id,
        });

        await this.reviewHelpfulVoteRepository.save(vote);

        // Increment helpful count
        await this.reviewRepository.increment({ id: reviewId }, 'helpfulCount', 1);
    }

    /**
     * Remove helpful mark
     */
    async removeHelpfulMark(reviewId: string, user: User): Promise<void> {
        const vote = await this.reviewHelpfulVoteRepository.findOne({
            where: {
                reviewId,
                userId: user.id,
            },
        });

        if (!vote) {
            throw new NotFoundException('Helpful vote not found');
        }

        await this.reviewHelpfulVoteRepository.remove(vote);

        // Decrement helpful count
        await this.reviewRepository.decrement({ id: reviewId }, 'helpfulCount', 1);
    }

    /**
     * Get business rating statistics
     */
    async getBusinessRatingStats(idOrSlug: string) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        let business;

        if (isUuid) {
            business = await this.businessRepository.findOne({
                where: { id: idOrSlug },
            });
        } else {
            business = await this.businessRepository.findOne({
                where: { slug: idOrSlug },
            });
        }

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        const businessId = business.id;

        const stats = await this.reviewRepository
            .createQueryBuilder('review')
            .select('review.rating', 'rating')
            .addSelect('COUNT(*)', 'count')
            .where('review.businessId = :businessId', { businessId })
            .andWhere('review.isApproved = :isApproved', { isApproved: true })
            .groupBy('review.rating')
            .orderBy('review.rating', 'DESC')
            .getRawMany();

        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        stats.forEach((stat) => {
            ratingDistribution[stat.rating] = parseInt(stat.count);
        });

        return {
            averageRating: business.averageRating,
            totalReviews: business.totalReviews,
            ratingDistribution,
        };
    }

    /**
     * Get reviews by business ID or slug
     */
    async findByBusiness(idOrSlug: string, query: GetReviewsDto) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        let businessId = idOrSlug;

        if (!isUuid) {
            const business = await this.businessRepository.findOne({
                where: { slug: idOrSlug },
                select: ['id'],
            });

            if (!business) {
                throw new NotFoundException('Business not found');
            }

            businessId = business.id;
        }

        return this.findAll({ ...query, businessId });
    }

    /**
     * Update business average rating and total reviews
     */
    private async updateBusinessRating(businessId: string): Promise<void> {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'averageRating')
            .addSelect('COUNT(*)', 'totalReviews')
            .where('review.businessId = :businessId', { businessId })
            .andWhere('review.isApproved = :isApproved', { isApproved: true })
            .getRawOne();

        const averageRating = parseFloat(result.averageRating) || 0;
        const totalReviews = parseInt(result.totalReviews) || 0;

        await this.businessRepository.update(businessId, {
            averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimals
            totalReviews,
        });
    }
}
