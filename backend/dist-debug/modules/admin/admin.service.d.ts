import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Listing } from '../../entities/business.entity';
import { Review } from '../../entities/review.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Transaction } from '../../entities/transaction.entity';
import { ModerateBusinessDto, ModerateReviewDto } from './dto/moderate.dto';
export declare class AdminService {
    private userRepository;
    private businessRepository;
    private reviewRepository;
    private vendorRepository;
    private transactionRepository;
    constructor(userRepository: Repository<User>, businessRepository: Repository<Listing>, reviewRepository: Repository<Review>, vendorRepository: Repository<Vendor>, transactionRepository: Repository<Transaction>);
    getGlobalStats(): Promise<{
        totalUsers: number;
        totalVendors: number;
        totalBusinesses: number;
        pendingBusinesses: number;
        totalReviews: number;
        totalRevenue: number;
    }>;
    moderateBusiness(id: string, dto: ModerateBusinessDto): Promise<Listing>;
    moderateReview(id: string, dto: ModerateReviewDto): Promise<Review>;
    verifyVendor(vendorId: string, isVerified?: boolean): Promise<Vendor>;
    getAllUsers(page?: number, limit?: number): Promise<import("../../common").PaginatedResponse<User>>;
}
