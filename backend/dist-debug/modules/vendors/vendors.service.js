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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vendor_entity_1 = require("../../entities/vendor.entity");
const user_entity_1 = require("../../entities/user.entity");
const business_entity_1 = require("../../entities/business.entity");
let VendorsService = class VendorsService {
    constructor(vendorRepository, userRepository, listingRepository) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
    }
    async becomeVendor(userId, createVendorDto) {
        let vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (vendor) {
            throw new common_1.ConflictException('You are already registered as a vendor');
        }
        vendor = this.vendorRepository.create({
            ...createVendorDto,
            userId,
            isVerified: false,
        });
        const savedVendor = await this.vendorRepository.save(vendor);
        await this.userRepository.update(userId, { role: user_entity_1.UserRole.VENDOR });
        return savedVendor;
    }
    async getProfile(userId) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['businesses', 'subscriptions'],
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor profile not found');
        }
        return vendor;
    }
    async updateProfile(userId, updateVendorDto) {
        console.log(`[VendorsService] Updating profile for vendor (user ${userId}):`, JSON.stringify(updateVendorDto, null, 2));
        let vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['businesses', 'subscriptions'],
        });
        if (!vendor) {
            console.log(`[VendorsService] No vendor record found for user ${userId} — creating one`);
            vendor = this.vendorRepository.create({
                userId,
                isVerified: false,
            });
        }
        Object.assign(vendor, updateVendorDto);
        await this.vendorRepository.save(vendor);
        console.log(`[VendorsService] Vendor profile saved successfully for user ${userId}`);
        return this.vendorRepository.findOne({
            where: { userId },
            relations: ['businesses', 'subscriptions'],
        });
    }
    async getDashboardStats(userId) {
        const vendor = await this.getProfile(userId);
        const businessCount = await this.listingRepository.count({
            where: { vendorId: vendor.id },
        });
        const totalLeads = await this.listingRepository
            .createQueryBuilder('listing')
            .select('SUM(listing.totalLeads)', 'total')
            .where('listing.vendorId = :vendorId', { vendorId: vendor.id })
            .getRawOne();
        const totalViews = await this.listingRepository
            .createQueryBuilder('listing')
            .select('SUM(listing.totalViews)', 'total')
            .where('listing.vendorId = :vendorId', { vendorId: vendor.id })
            .getRawOne();
        return {
            businessCount,
            activeSubscription: vendor.subscriptions.find(s => s.status === 'active'),
            totalLeads: parseInt(totalLeads?.total || '0'),
            totalViews: parseInt(totalViews?.total || '0'),
            isVerified: vendor.isVerified,
        };
    }
    async submitVerification(userId, documents) {
        const vendor = await this.getProfile(userId);
        vendor.verificationDocuments = documents;
        return this.vendorRepository.save(vendor);
    }
    async getByCity(city) {
        const rows = await this.listingRepository
            .createQueryBuilder('listing')
            .select('listing.vendorId', 'vendorId')
            .addSelect('COUNT(listing.id)', 'listingCount')
            .addSelect('AVG(CAST(listing.averageRating AS FLOAT))', 'avgRating')
            .addSelect('SUM(listing.totalViews)', 'totalViews')
            .where('LOWER(listing.city) = LOWER(:city)', { city })
            .andWhere('listing.status = :status', { status: 'approved' })
            .groupBy('listing.vendorId')
            .getRawMany();
        if (!rows.length)
            return [];
        const vendorIds = rows.map(r => r.vendorId);
        const vendors = await this.vendorRepository
            .createQueryBuilder('vendor')
            .leftJoinAndSelect('vendor.user', 'user')
            .whereInIds(vendorIds)
            .getMany();
        const sampleListings = await this.listingRepository
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.category', 'category')
            .where('listing.vendorId IN (:...ids)', { ids: vendorIds })
            .andWhere('listing.status = :status', { status: 'approved' })
            .orderBy('listing.averageRating', 'DESC')
            .getMany();
        return vendors.map(vendor => {
            const stat = rows.find(r => r.vendorId === vendor.id);
            const listings = sampleListings.filter(l => l.vendorId === vendor.id);
            const cover = listings.find(l => l.images?.length) || listings[0];
            const categories = [...new Set(listings.map(l => l.category?.name).filter(Boolean))];
            return {
                id: vendor.id,
                businessName: vendor.businessName || vendor.user?.fullName || 'Unnamed Business',
                vendorName: vendor.user?.email
                    ? vendor.user.email.split('@')[0]
                    : (vendor.user?.fullName || vendor.businessName || 'Unknown'),
                businessEmail: vendor.businessEmail,
                businessPhone: vendor.businessPhone,
                businessAddress: vendor.businessAddress,
                isVerified: vendor.isVerified,
                socialLinks: vendor.socialLinks || [],
                avatarUrl: vendor.user?.avatarUrl || null,
                coverImage: cover?.images?.[0] || null,
                listingCount: parseInt(stat?.listingCount || '0'),
                avgRating: parseFloat(parseFloat(stat?.avgRating || '0').toFixed(1)),
                totalViews: parseInt(stat?.totalViews || '0'),
                categories,
                sampleListings: listings.slice(0, 3).map(l => ({
                    id: l.id,
                    title: l.title,
                    slug: l.slug,
                    images: l.images,
                })),
            };
        });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map