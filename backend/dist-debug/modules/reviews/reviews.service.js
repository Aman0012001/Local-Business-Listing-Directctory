"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../../entities/review.entity");
const review_helpful_vote_entity_1 = require("../../entities/review-helpful-vote.entity");
const business_entity_1 = require("../../entities/business.entity");
const user_entity_1 = require("../../entities/user.entity");
const pagination_util_1 = require("../../common/utils/pagination.util");
let ReviewsService = class ReviewsService {
    constructor(reviewRepository, reviewHelpfulVoteRepository, listingRepository) {
        this.reviewRepository = reviewRepository;
        this.reviewHelpfulVoteRepository = reviewHelpfulVoteRepository;
        this.listingRepository = listingRepository;
    }
    async create(createReviewDto, user) {
        const { businessId } = createReviewDto;
        const listing = await this.listingRepository.findOne({
            where: { id: businessId },
            relations: ['vendor'],
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.vendor?.userId === user.id) {
            throw new common_1.ForbiddenException('You cannot review your own business listing');
        }
        const existingReview = await this.reviewRepository.findOne({
            where: {
                businessId,
                userId: user.id,
            },
        });
        if (existingReview) {
            throw new common_1.ConflictException('You have already reviewed this business');
        }
        const review = this.reviewRepository.create({
            ...createReviewDto,
            userId: user.id,
            isApproved: true,
        });
        const savedReview = await this.reviewRepository.save(review);
        await this.updateBusinessRating(businessId);
        return this.findOne(savedReview.id);
    }
    async findAll(getReviewsDto) {
        const { page = 1, limit = 20, businessId, userId, rating } = getReviewsDto;
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const queryBuilder = this.reviewRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.business', 'business')
            .where('review.isApproved = :isApproved', { isApproved: true });
        if (businessId) {
            queryBuilder.andWhere('review.businessId = :businessId', { businessId });
        }
        if (userId) {
            queryBuilder.andWhere('review.userId = :userId', { userId });
        }
        if (rating) {
            queryBuilder.andWhere('review.rating = :rating', { rating });
        }
        if (getReviewsDto.vendorId) {
            queryBuilder.andWhere('business.vendorId = :vendorId', {
                vendorId: getReviewsDto.vendorId,
            });
        }
        queryBuilder.orderBy('review.createdAt', 'DESC');
        const total = await queryBuilder.getCount();
        const reviews = await queryBuilder.skip(skip).take(limit).getMany();
        return (0, pagination_util_1.createPaginatedResponse)(reviews, page, limit, total);
    }
    async findOne(id) {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user', 'business', 'helpfulVotes'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async update(id, updateReviewDto, user) {
        const review = await this.reviewRepository.findOne({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== user.id && user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
        }
        await this.reviewRepository.update(id, updateReviewDto);
        if (updateReviewDto.rating && updateReviewDto.rating !== review.rating) {
            await this.updateBusinessRating(review.businessId);
        }
        return this.findOne(id);
    }
    async remove(id, user) {
        const review = await this.reviewRepository.findOne({
            where: { id },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== user.id && user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        const businessId = review.businessId;
        await this.reviewRepository.remove(review);
        await this.updateBusinessRating(businessId);
    }
    async addVendorResponse(id, vendorResponseDto, user) {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['business', 'business.vendor'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.business.vendor.userId !== user.id &&
            user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Only the business owner can respond to reviews');
        }
        review.vendorResponse = vendorResponseDto.response;
        review.vendorResponseAt = new Date();
        await this.reviewRepository.save(review);
        return this.findOne(id);
    }
    async markAsHelpful(reviewId, user) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        const existingVote = await this.reviewHelpfulVoteRepository.findOne({
            where: {
                reviewId,
                userId: user.id,
            },
        });
        if (existingVote) {
            throw new common_1.ConflictException('You have already marked this review as helpful');
        }
        const vote = this.reviewHelpfulVoteRepository.create({
            reviewId,
            userId: user.id,
        });
        await this.reviewHelpfulVoteRepository.save(vote);
        await this.reviewRepository.increment({ id: reviewId }, 'helpfulCount', 1);
    }
    async removeHelpfulMark(reviewId, user) {
        const vote = await this.reviewHelpfulVoteRepository.findOne({
            where: {
                reviewId,
                userId: user.id,
            },
        });
        if (!vote) {
            throw new common_1.NotFoundException('Helpful vote not found');
        }
        await this.reviewHelpfulVoteRepository.remove(vote);
        await this.reviewRepository.decrement({ id: reviewId }, 'helpfulCount', 1);
    }
    async getBusinessRatingStats(idOrSlug) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        let listing;
        if (isUuid) {
            listing = await this.listingRepository.findOne({
                where: { id: idOrSlug },
            });
        }
        else {
            listing = await this.listingRepository.findOne({
                where: { slug: idOrSlug },
            });
        }
        if (!listing) {
            throw new common_1.NotFoundException('Business not found');
        }
        const businessId = listing.id;
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
            averageRating: listing.averageRating,
            totalReviews: listing.totalReviews,
            ratingDistribution,
        };
    }
    async findByBusiness(idOrSlug, query) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        let businessId = idOrSlug;
        if (!isUuid) {
            const listing = await this.listingRepository.findOne({
                where: { slug: idOrSlug },
                select: ['id'],
            });
            if (!listing) {
                throw new common_1.NotFoundException('Listing not found');
            }
            businessId = listing.id;
        }
        return this.findAll({ ...query, businessId });
    }
    async updateBusinessRating(businessId) {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'averageRating')
            .addSelect('COUNT(*)', 'totalReviews')
            .where('review.businessId = :businessId', { businessId })
            .andWhere('review.isApproved = :isApproved', { isApproved: true })
            .getRawOne();
        const averageRating = parseFloat(result.averageRating) || 0;
        const totalReviews = parseInt(result.totalReviews) || 0;
        await this.listingRepository.update(businessId, {
            averageRating: Math.round(averageRating * 100) / 100,
            totalReviews,
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(review_helpful_vote_entity_1.ReviewHelpfulVote)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map