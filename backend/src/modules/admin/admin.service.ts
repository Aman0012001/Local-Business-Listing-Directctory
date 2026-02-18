import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Business, BusinessStatus } from '../../entities/business.entity';
import { Review } from '../../entities/review.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Transaction } from '../../entities/transaction.entity';
import { ModerateBusinessDto, ModerateReviewDto } from './dto/moderate.dto';
import {
    createPaginatedResponse,
    calculateSkip,
} from '../../common/utils/pagination.util';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Business)
        private businessRepository: Repository<Business>,
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
    ) { }

    /**
     * Get global site statistics
     */
    async getGlobalStats() {
        const userCount = await this.userRepository.count();
        const vendorCount = await this.vendorRepository.count();
        const businessCount = await this.businessRepository.count();
        const pendingBusinessCount = await this.businessRepository.count({
            where: { status: BusinessStatus.PENDING },
        });
        const reviewCount = await this.reviewRepository.count();

        const revenue = await this.transactionRepository
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.status = :status', { status: 'completed' })
            .getRawOne();

        return {
            totalUsers: userCount,
            totalVendors: vendorCount,
            totalBusinesses: businessCount,
            pendingBusinesses: pendingBusinessCount,
            totalReviews: reviewCount,
            totalRevenue: parseFloat(revenue?.total || '0'),
        };
    }

    /**
     * Moderate a business listing
     */
    async moderateBusiness(id: string, dto: ModerateBusinessDto) {
        const business = await this.businessRepository.findOne({ where: { id } });
        if (!business) throw new NotFoundException('Business not found');

        business.status = dto.status;
        if (dto.status === BusinessStatus.APPROVED) {
            business.approvedAt = new Date();
        } else if (dto.status === BusinessStatus.REJECTED) {
            business.rejectedAt = new Date();
            business.rejectionReason = dto.reason;
        }

        return this.businessRepository.save(business);
    }

    /**
     * Moderate a review
     */
    async moderateReview(id: string, dto: ModerateReviewDto) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');

        review.isApproved = dto.isApproved;
        return this.reviewRepository.save(review);
    }

    /**
     * Force verify a vendor
     */
    async verifyVendor(vendorId: string, isVerified = true) {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');

        vendor.isVerified = isVerified;
        return this.vendorRepository.save(vendor);
    }

    /**
     * Get all users for admin management
     */
    async getAllUsers(page = 1, limit = 20) {
        const skip = calculateSkip(page, limit);

        const [users, total] = await this.userRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return createPaginatedResponse(users, page, limit, total);
    }
}
