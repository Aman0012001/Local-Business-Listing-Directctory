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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const business_entity_1 = require("../../entities/business.entity");
const review_entity_1 = require("../../entities/review.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const pagination_util_1 = require("../../common/utils/pagination.util");
let AdminService = class AdminService {
    constructor(userRepository, businessRepository, reviewRepository, vendorRepository, transactionRepository) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.reviewRepository = reviewRepository;
        this.vendorRepository = vendorRepository;
        this.transactionRepository = transactionRepository;
    }
    async getGlobalStats() {
        const userCount = await this.userRepository.count();
        const vendorCount = await this.vendorRepository.count();
        const businessCount = await this.businessRepository.count();
        const pendingBusinessCount = await this.businessRepository.count({
            where: { status: business_entity_1.BusinessStatus.PENDING },
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
    async moderateBusiness(id, dto) {
        const business = await this.businessRepository.findOne({ where: { id } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        business.status = dto.status;
        if (dto.status === business_entity_1.BusinessStatus.APPROVED) {
            business.approvedAt = new Date();
        }
        else if (dto.status === business_entity_1.BusinessStatus.REJECTED) {
            business.rejectedAt = new Date();
            business.rejectionReason = dto.reason;
        }
        return this.businessRepository.save(business);
    }
    async moderateReview(id, dto) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        review.isApproved = dto.isApproved;
        return this.reviewRepository.save(review);
    }
    async verifyVendor(vendorId, isVerified = true) {
        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        vendor.isVerified = isVerified;
        return this.vendorRepository.save(vendor);
    }
    async getAllUsers(page = 1, limit = 20) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const [users, total] = await this.userRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return (0, pagination_util_1.createPaginatedResponse)(users, page, limit, total);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __param(2, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(3, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(4, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map