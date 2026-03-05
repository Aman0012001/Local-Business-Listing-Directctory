import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Listing, BusinessStatus } from '../../entities/business.entity';
import { Review } from '../../entities/review.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Transaction } from '../../entities/transaction.entity';
import { SystemSetting } from '../../entities/system-setting.entity';
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
        @InjectRepository(Listing)
        private businessRepository: Repository<Listing>,
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(SystemSetting)
        private settingsRepository: Repository<SystemSetting>,
    ) { }

    /**
     * Get all system settings
     */
    async getSettings() {
        const settings = await this.settingsRepository.find();
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    }

    /**
     * Update system settings
     */
    async updateSettings(settings: Record<string, string>) {
        const entries = Object.entries(settings);
        for (const [key, value] of entries) {
            let setting = await this.settingsRepository.findOne({ where: { key } });
            if (!setting) {
                setting = this.settingsRepository.create({ key, value, group: 'general' });
            } else {
                setting.value = value;
            }
            await this.settingsRepository.save(setting);
        }
        return this.getSettings();
    }

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

    /**
     * Update a user's role
     */
    async updateUserRole(userId: string, role: UserRole) {
        const allowedRoles = [UserRole.USER, UserRole.VENDOR, UserRole.ADMIN];
        if (!allowedRoles.includes(role)) {
            throw new BadRequestException('Invalid role. Only user, vendor, or admin allowed.');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        user.role = role;
        return this.userRepository.save(user);
    }

    /**
     * Toggle a user's active status
     */
    async toggleUserStatus(userId: string, isActive: boolean) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        user.isActive = isActive;
        return this.userRepository.save(user);
    }

    /**
     * Delete a user and all related data
     */
    async deleteUser(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['vendor', 'vendor.businesses'],
        });

        if (!user) throw new NotFoundException('User not found');

        // Manual cleanup to satisfy foreign keys
        if (user.vendor) {
            if (user.vendor.businesses && user.vendor.businesses.length > 0) {
                await this.businessRepository.remove(user.vendor.businesses);
            }
            await this.vendorRepository.remove(user.vendor);
        }

        return this.userRepository.remove(user);
    }

    /**
     * Get all businesses with filters
     */
    async getAllBusinesses(page = 1, limit = 20, status?: BusinessStatus, search?: string) {
        const skip = calculateSkip(page, limit);
        const query = this.businessRepository.createQueryBuilder('business')
            .leftJoinAndSelect('business.vendor', 'vendor')
            .leftJoinAndSelect('business.category', 'category')
            .orderBy('business.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        if (status) {
            query.andWhere('business.status = :status', { status });
        }

        if (search) {
            query.andWhere(
                '(business.title ILIKE :search OR business.address ILIKE :search OR business.city ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [businesses, total] = await query.getManyAndCount();
        return createPaginatedResponse(businesses, page, limit, total);
    }

    /**
     * Delete a business and related records
     */
    async deleteBusiness(id: string) {
        const business = await this.businessRepository.findOne({
            where: { id },
            relations: ['businessHours', 'businessAmenities', 'reviews', 'leads', 'savedListings'],
        });

        if (!business) throw new NotFoundException('Business not found');

        // Delete related records manually if not cascading
        // Note: Many of these usually have onDelete: 'CASCADE' in a well-defined schema,
        // but we'll be safe here.
        return this.businessRepository.remove(business);
    }

    /**
     * Get all vendors with filters
     */
    async getAllVendors(page = 1, limit = 20, isVerified?: boolean, search?: string) {
        const skip = calculateSkip(page, limit);
        const query = this.vendorRepository.createQueryBuilder('vendor')
            .leftJoinAndSelect('vendor.user', 'user')
            .orderBy('vendor.createdAt', 'DESC')
            .skip(skip)
            .take(limit);

        if (isVerified !== undefined) {
            query.andWhere('vendor.isVerified = :isVerified', { isVerified });
        }

        if (search) {
            query.andWhere(
                '(vendor.businessName ILIKE :search OR vendor.businessEmail ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [vendors, total] = await query.getManyAndCount();

        // Get total verified count for the dashboard
        const totalVerified = await this.vendorRepository.count({ where: { isVerified: true } });

        const response = createPaginatedResponse(vendors, page, limit, total);
        return {
            ...response,
            meta: {
                ...response.meta,
                totalVerified,
            },
        };
    }
}
