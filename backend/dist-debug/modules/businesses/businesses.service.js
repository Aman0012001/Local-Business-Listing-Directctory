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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../../entities/business.entity");
const business_hours_entity_1 = require("../../entities/business-hours.entity");
const business_amenity_entity_1 = require("../../entities/business-amenity.entity");
const amenity_entity_1 = require("../../entities/amenity.entity");
const category_entity_1 = require("../../entities/category.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const user_entity_1 = require("../../entities/user.entity");
const search_business_dto_1 = require("./dto/search-business.dto");
const pagination_util_1 = require("../../common/utils/pagination.util");
const slug_util_1 = require("../../common/utils/slug.util");
const notifications_service_1 = require("../notifications/notifications.service");
let BusinessesService = class BusinessesService {
    constructor(listingRepository, businessHoursRepository, businessAmenityRepository, amenityRepository, categoryRepository, vendorRepository, notificationsService) {
        this.listingRepository = listingRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.businessAmenityRepository = businessAmenityRepository;
        this.amenityRepository = amenityRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
        this.notificationsService = notificationsService;
    }
    async create(createBusinessDto, user) {
        let vendor = await this.vendorRepository.findOne({
            where: { userId: user.id },
            relations: ['subscriptions'],
        });
        if (!vendor) {
            if (user.role === user_entity_1.UserRole.USER) {
                throw new common_1.ForbiddenException('Only vendors and administrators can create listings');
            }
            vendor = this.vendorRepository.create({
                userId: user.id,
                businessName: `${user.fullName}'s Business`,
                businessPhone: user.phone || '0000000000',
                isVerified: true,
            });
            vendor = await this.vendorRepository.save(vendor);
        }
        const category = await this.categoryRepository.findOne({
            where: { id: createBusinessDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const slug = (0, slug_util_1.generateUniqueSlug)(createBusinessDto.title);
        const listing = this.listingRepository.create({
            ...createBusinessDto,
            vendorId: vendor.id,
            slug,
            status: business_entity_1.BusinessStatus.PENDING,
        });
        const savedListing = await this.listingRepository.save(listing);
        if (createBusinessDto.businessHours?.length) {
            const hours = createBusinessDto.businessHours.map((hour) => this.businessHoursRepository.create({
                businessId: savedListing.id,
                ...hour,
            }));
            await this.businessHoursRepository.save(hours);
        }
        if (createBusinessDto.amenityIds?.length) {
            const amenities = createBusinessDto.amenityIds.map((amenityId) => this.businessAmenityRepository.create({
                businessId: savedListing.id,
                amenityId,
            }));
            await this.businessAmenityRepository.save(amenities);
        }
        const result = await this.findOne(savedListing.id);
        this.notificationsService.broadcast({
            title: '📍 New Business Listed!',
            message: `"${result.title}" just joined ${result.category?.name ? result.category.name + ' listings' : 'our directory'}. Check it out!`,
            type: 'new_listing',
            data: { businessId: result.id, slug: result.slug },
        }).catch(() => { });
        return result;
    }
    async search(searchDto) {
        const { page = 1, limit = 20, latitude, longitude, radius, city, categoryId, categorySlug, minRating, priceRange, featuredOnly, verifiedOnly, openNow, sortBy, } = searchDto;
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const queryBuilder = this.listingRepository
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.category', 'category')
            .leftJoinAndSelect('listing.vendor', 'vendor')
            .leftJoinAndSelect('listing.businessHours', 'businessHours')
            .leftJoinAndSelect('listing.businessAmenities', 'businessAmenities')
            .leftJoinAndSelect('businessAmenities.amenity', 'amenity')
            .where('listing.status IN (:...statuses)', { statuses: [business_entity_1.BusinessStatus.PENDING, business_entity_1.BusinessStatus.APPROVED] });
        if (searchDto.query) {
            queryBuilder.andWhere('(listing.title ILIKE :query OR listing.description ILIKE :query OR listing.metaKeywords ILIKE :query)', { query: `%${searchDto.query}%` });
        }
        if (searchDto.categoryId) {
            queryBuilder.andWhere('category.id = :categoryId', {
                categoryId: searchDto.categoryId,
            });
        }
        if (searchDto.categorySlug) {
            queryBuilder.andWhere('category.slug = :categorySlug', {
                categorySlug: searchDto.categorySlug,
            });
        }
        if (city) {
            queryBuilder.andWhere('listing.city ILIKE :city', {
                city: `%${city}%`,
            });
        }
        if (minRating) {
            queryBuilder.andWhere('listing.averageRating >= :minRating', {
                minRating,
            });
        }
        if (priceRange) {
            queryBuilder.andWhere('listing.priceRange = :priceRange', {
                priceRange,
            });
        }
        if (featuredOnly) {
            queryBuilder.andWhere('listing.isFeatured = :featured', { featured: true });
        }
        if (verifiedOnly) {
            queryBuilder.andWhere('listing.isVerified = :verified', { verified: true });
        }
        if (openNow) {
            const now = new Date();
            const day = now
                .toLocaleDateString('en-US', { weekday: 'long' })
                .toLowerCase();
            const time = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
            });
            queryBuilder
                .leftJoin('listing.businessHours', 'bh')
                .andWhere('bh.dayOfWeek = :day', { day })
                .andWhere('bh.isOpen = :isOpen', { isOpen: true })
                .andWhere(':time BETWEEN bh.openTime AND bh.closeTime', {
                time,
            });
        }
        if (searchDto.query) {
            queryBuilder.addOrderBy(`CASE WHEN listing.metaKeywords ILIKE :kwQuery THEN 0 ELSE 1 END`, 'ASC');
            queryBuilder.setParameter('kwQuery', `%${searchDto.query}%`);
        }
        switch (sortBy) {
            case search_business_dto_1.SearchSortBy.DISTANCE:
                if (latitude && longitude) {
                    queryBuilder.addOrderBy('distance', 'ASC');
                }
                break;
            case search_business_dto_1.SearchSortBy.RATING:
                queryBuilder.addOrderBy('listing.averageRating', 'DESC');
                break;
            case 'newest':
                queryBuilder.addOrderBy('listing.createdAt', 'DESC');
                break;
            default:
                queryBuilder
                    .addOrderBy('listing.isSponsored', 'DESC')
                    .addOrderBy('listing.isFeatured', 'DESC')
                    .addOrderBy('listing.averageRating', 'DESC');
        }
        const total = await queryBuilder.getCount();
        const listings = await queryBuilder.skip(skip).take(limit).getRawAndEntities();
        const results = listings.entities.map((listing, index) => {
            const result = listing;
            return result;
        });
        return (0, pagination_util_1.createPaginatedResponse)(results, page, limit, total);
    }
    async findOne(id, viewerUserId) {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: [
                'category',
                'vendor',
                'vendor.user',
                'businessHours',
                'businessAmenities',
                'businessAmenities.amenity',
                'reviews',
                'reviews.user',
            ],
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        const isOwner = viewerUserId && listing.vendor?.user?.id === viewerUserId;
        if (!isOwner) {
            await this.listingRepository.increment({ id }, 'totalViews', 1);
            listing.totalViews = (listing.totalViews || 0) + 1;
        }
        return listing;
    }
    async findBySlug(slug, viewerUserId) {
        const listing = await this.listingRepository.findOne({
            where: { slug },
            relations: [
                'category',
                'vendor',
                'vendor.user',
                'businessHours',
                'businessAmenities',
                'businessAmenities.amenity',
                'reviews',
                'reviews.user',
            ],
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        const isOwner = viewerUserId && listing.vendor?.user?.id === viewerUserId;
        if (!isOwner) {
            await this.listingRepository.increment({ id: listing.id }, 'totalViews', 1);
            listing.totalViews = (listing.totalViews || 0) + 1;
        }
        return listing;
    }
    async update(id, updateBusinessDto, user) {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.vendor.userId !== user.id && user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Unauthorized access');
        }
        if (updateBusinessDto.title && updateBusinessDto.title !== listing.title) {
            updateBusinessDto['slug'] = (0, slug_util_1.generateUniqueSlug)(updateBusinessDto.title);
        }
        if (updateBusinessDto.businessHours) {
            await this.businessHoursRepository.delete({ businessId: id });
            const hours = updateBusinessDto.businessHours.map((hour) => this.businessHoursRepository.create({
                businessId: id,
                ...hour,
            }));
            await this.businessHoursRepository.save(hours);
        }
        if (updateBusinessDto.amenityIds) {
            await this.businessAmenityRepository.delete({ businessId: id });
            const amenities = updateBusinessDto.amenityIds.map((amenityId) => this.businessAmenityRepository.create({
                businessId: id,
                amenityId,
            }));
            await this.businessAmenityRepository.save(amenities);
        }
        const { businessHours, amenityIds, ...updateData } = updateBusinessDto;
        Object.assign(listing, updateData);
        await this.listingRepository.save(listing);
        return this.findOne(id);
    }
    async remove(id, user) {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.vendor.userId !== user.id && user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Unauthorized access');
        }
        await this.listingRepository.remove(listing);
    }
    async getVendorBusinesses(userId, page = 1, limit = 20) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor not found');
        }
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const [listings, total] = await this.listingRepository.findAndCount({
            where: { vendorId: vendor.id },
            relations: ['category'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return (0, pagination_util_1.createPaginatedResponse)(listings, page, limit, total);
    }
    async getSimilar(idOrSlug, limit = 4) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        let listing;
        if (isUuid) {
            listing = await this.listingRepository.findOne({
                where: { id: idOrSlug },
                select: ['id', 'categoryId'],
            });
        }
        else {
            listing = await this.listingRepository.findOne({
                where: { slug: idOrSlug },
                select: ['id', 'categoryId'],
            });
        }
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        return this.listingRepository.find({
            where: {
                categoryId: listing.categoryId,
                id: (0, typeorm_2.Not)(listing.id),
                status: business_entity_1.BusinessStatus.APPROVED,
            },
            take: Number(limit),
        });
    }
    async updateImage(id, imageUrl, user) {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.vendor.userId !== user.id && user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Unauthorized access');
        }
        listing.coverImageUrl = imageUrl;
        await this.listingRepository.save(listing);
        return this.findOne(id);
    }
    async getAllAmenities() {
        return this.amenityRepository.find({
            order: { name: 'ASC' },
        });
    }
    async createAmenity(name, icon) {
        const existing = await this.amenityRepository.findOne({
            where: { name },
        });
        if (existing) {
            return existing;
        }
        const amenity = this.amenityRepository.create({
            name,
            icon: icon || 'Sparkles',
        });
        return this.amenityRepository.save(amenity);
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __param(1, (0, typeorm_1.InjectRepository)(business_hours_entity_1.BusinessHours)),
    __param(2, (0, typeorm_1.InjectRepository)(business_amenity_entity_1.BusinessAmenity)),
    __param(3, (0, typeorm_1.InjectRepository)(amenity_entity_1.Amenity)),
    __param(4, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(5, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map