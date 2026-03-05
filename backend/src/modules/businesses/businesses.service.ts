import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, Brackets } from 'typeorm';
import { Listing, BusinessStatus } from '../../entities/business.entity';
import { BusinessHours, DayOfWeek } from '../../entities/business-hours.entity';
import { BusinessAmenity } from '../../entities/business-amenity.entity';
import { Amenity } from '../../entities/amenity.entity';
import { Category, CategoryStatus } from '../../entities/category.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SearchBusinessDto, SearchSortBy } from './dto/search-business.dto';
import {
    createPaginatedResponse,
    calculateSkip,
} from '../../common/utils/pagination.util';
import { generateSlug, generateUniqueSlug } from '../../common/utils/slug.util';
import { calculateDistance } from '../../common/utils/geolocation.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BusinessesService {
    constructor(
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
        @InjectRepository(BusinessHours)
        private businessHoursRepository: Repository<BusinessHours>,
        @InjectRepository(BusinessAmenity)
        private businessAmenityRepository: Repository<BusinessAmenity>,
        @InjectRepository(Amenity)
        private amenityRepository: Repository<Amenity>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Create a new listing
     */
    async create(createBusinessDto: CreateBusinessDto, user: User): Promise<Listing> {
        // Find or create vendor profile for the user
        let vendor = await this.vendorRepository.findOne({
            where: { userId: user.id },
            relations: ['subscriptions'],
        });

        if (!vendor) {
            // Only allow if user is a vendor, admin or superadmin
            if (user.role === UserRole.USER) {
                throw new ForbiddenException('Only vendors and administrators can create listings');
            }

            // Create a default vendor profile if it doesn't exist (for admins/superadmins)
            vendor = this.vendorRepository.create({
                userId: user.id,
                businessName: `${user.fullName}'s Business`,
                businessPhone: user.phone || '0000000000',
                isVerified: true,
            });
            vendor = await this.vendorRepository.save(vendor);
        }

        // Verify category exists
        const category = await this.categoryRepository.findOne({
            where: { id: createBusinessDto.categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (category.status !== CategoryStatus.ACTIVE) {
            throw new BadRequestException('Invalid category: selected category is disabled');
        }

        // Generate unique slug
        const slug = generateUniqueSlug(createBusinessDto.title);

        // Create listing
        const listing = this.listingRepository.create({
            ...createBusinessDto,
            vendorId: vendor.id,
            slug,
            status: BusinessStatus.PENDING,
        });

        const savedListing = await this.listingRepository.save(listing);

        // Create business hours if provided
        if (createBusinessDto.businessHours?.length) {
            const hours = createBusinessDto.businessHours.map((hour) =>
                this.businessHoursRepository.create({
                    businessId: savedListing.id,
                    ...hour,
                }),
            );
            await this.businessHoursRepository.save(hours);
        }

        // Create business amenities if provided
        if (createBusinessDto.amenityIds?.length) {
            const amenities = createBusinessDto.amenityIds.map((amenityId) =>
                this.businessAmenityRepository.create({
                    businessId: savedListing.id,
                    amenityId,
                }),
            );
            await this.businessAmenityRepository.save(amenities);
        }

        // Return fully populated listing
        const result = await this.findOne(savedListing.id);

        // Broadcast to all users: new listing is live
        this.notificationsService.broadcast({
            title: '📍 New Business Listed!',
            message: `"${result.title}" just joined ${result.category?.name ? result.category.name + ' listings' : 'our directory'}. Check it out!`,
            type: 'new_listing',
            data: { businessId: result.id, slug: result.slug },
        }).catch(() => {/* non-blocking */ });

        return result;
    }

    /**
     * Search businesses with filters and geo-location
     */
    async search(searchDto: SearchBusinessDto) {
        const {
            page = 1,
            limit = 20,
            latitude,
            longitude,
            radius,
            city,
            categoryId,
            categorySlug,
            minRating,
            priceRange,
            featuredOnly,
            verifiedOnly,
            openNow,
            sortBy,
        } = searchDto;
        const skip = calculateSkip(page, limit);

        const queryBuilder = this.listingRepository
            .createQueryBuilder('listing')
            .leftJoinAndSelect('listing.category', 'category')
            .leftJoinAndSelect('listing.vendor', 'vendor')
            .leftJoinAndSelect('listing.businessHours', 'businessHours')
            .leftJoinAndSelect('listing.businessAmenities', 'businessAmenities')
            .leftJoinAndSelect('businessAmenities.amenity', 'amenity')
            .where('listing.status IN (:...statuses)', { statuses: [BusinessStatus.PENDING, BusinessStatus.APPROVED] });

        // Text search — matches title, description and vendor-added search keywords
        if (searchDto.query) {
            queryBuilder.andWhere(
                '(listing.title ILIKE :query OR listing.description ILIKE :query OR listing.metaKeywords ILIKE :query OR vendor.businessName ILIKE :query)',
                { query: `%${searchDto.query}%` },
            );
        }

        // Category filter
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

        // City filter
        if (city) {
            queryBuilder.andWhere('listing.city ILIKE :city', {
                city: `%${city}%`,
            });
        }

        // Rating filter
        if (minRating) {
            queryBuilder.andWhere('listing.averageRating >= :minRating', {
                minRating,
            });
        }

        // Price range filter
        if (priceRange) {
            queryBuilder.andWhere('listing.priceRange = :priceRange', {
                priceRange,
            });
        }

        // Featured only
        if (featuredOnly) {
            queryBuilder.andWhere('listing.isFeatured = :featured', { featured: true });
        }
        if (verifiedOnly) {
            queryBuilder.andWhere('listing.isVerified = :verified', { verified: true });
        }

        // Open Now filter
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

        // Sorting
        // 1) Keyword boost: if the query matches a vendor's metaKeywords, rank that listing first
        if (searchDto.query) {
            queryBuilder.addOrderBy(
                `CASE WHEN listing.metaKeywords ILIKE :query THEN 0 ELSE 1 END`,
                'ASC',
            );
        }

        // 2) Secondary sort (user-selected or default relevance)
        switch (sortBy) {
            case SearchSortBy.DISTANCE:
                if (latitude && longitude) {
                    queryBuilder.addOrderBy('distance', 'ASC');
                }
                break;
            case SearchSortBy.RATING:
                queryBuilder.addOrderBy('listing.averageRating', 'DESC');
                break;
            case 'newest':
                queryBuilder.addOrderBy('listing.createdAt', 'DESC');
                break;
            default:
                // Relevance (sponsored > featured > rating)
                queryBuilder
                    .addOrderBy('listing.isSponsored', 'DESC')
                    .addOrderBy('listing.isFeatured', 'DESC')
                    .addOrderBy('listing.averageRating', 'DESC');
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const listings = await queryBuilder.skip(skip).take(limit).getRawAndEntities();

        // Map and format results
        const results = listings.entities.map((listing, index) => {
            const result: any = listing;
            // Add distance calculation if needed
            return result;
        });

        return createPaginatedResponse(results, page, limit, total);
    }

    /**
     * Get listing by ID
     */
    async findOne(id: string, viewerUserId?: string): Promise<Listing> {
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
            throw new NotFoundException('Listing not found');
        }

        // Only count views from non-owners (skip vendor self-views)
        const isOwner = viewerUserId && listing.vendor?.user?.id === viewerUserId;
        if (!isOwner) {
            await this.listingRepository.increment({ id }, 'totalViews', 1);
            listing.totalViews = (listing.totalViews || 0) + 1;
        }

        return listing;
    }

    /**
     * Get listing by slug
     */
    async findBySlug(slug: string, viewerUserId?: string): Promise<Listing> {
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
            throw new NotFoundException('Listing not found');
        }

        // Only count views from non-owners (skip vendor self-views)
        const isOwner = viewerUserId && listing.vendor?.user?.id === viewerUserId;
        if (!isOwner) {
            await this.listingRepository.increment({ id: listing.id }, 'totalViews', 1);
            listing.totalViews = (listing.totalViews || 0) + 1;
        }

        return listing;
    }

    /**
     * Update listing
     */
    async update(
        id: string,
        updateBusinessDto: UpdateBusinessDto,
        user: User,
    ): Promise<Listing> {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        // Check ownership - Reinforcing filtering as requested
        if (listing.vendor.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Unauthorized access');
        }

        // Update slug if title changed
        if (updateBusinessDto.title && updateBusinessDto.title !== listing.title) {
            updateBusinessDto['slug'] = generateUniqueSlug(updateBusinessDto.title);
        }

        // Verify category if changed
        if (updateBusinessDto.categoryId && updateBusinessDto.categoryId !== listing.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateBusinessDto.categoryId },
            });

            if (!category) {
                throw new NotFoundException('Category not found');
            }

            if (category.status !== CategoryStatus.ACTIVE) {
                throw new BadRequestException('Invalid category: selected category is disabled');
            }
        }

        // Update business hours if provided
        if (updateBusinessDto.businessHours) {
            await this.businessHoursRepository.delete({ businessId: id });
            const hours = updateBusinessDto.businessHours.map((hour) =>
                this.businessHoursRepository.create({
                    businessId: id,
                    ...hour,
                }),
            );
            await this.businessHoursRepository.save(hours);
        }

        // Update amenities if provided
        if (updateBusinessDto.amenityIds) {
            await this.businessAmenityRepository.delete({ businessId: id });
            const amenities = updateBusinessDto.amenityIds.map((amenityId) =>
                this.businessAmenityRepository.create({
                    businessId: id,
                    amenityId,
                }),
            );
            await this.businessAmenityRepository.save(amenities);
        }

        // Remove nested objects from update
        const { businessHours, amenityIds, ...updateData } = updateBusinessDto;

        // Apply updates to the listing object
        Object.assign(listing, updateData);

        await this.listingRepository.save(listing);

        return this.findOne(id);
    }

    /**
     * Delete listing
     */
    async remove(id: string, user: User): Promise<void> {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        // Check ownership - Reinforcing filtering as requested
        if (listing.vendor.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Unauthorized access');
        }

        await this.listingRepository.remove(listing);
    }

    /**
     * Get vendor's listings
     */
    async getVendorBusinesses(userId: string, page = 1, limit = 20) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        const skip = calculateSkip(page, limit);

        const [listings, total] = await this.listingRepository.findAndCount({
            where: { vendorId: vendor.id },
            relations: ['category'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return createPaginatedResponse(listings, page, limit, total);
    }

    /**
     * Get similar listings (same category)
     */
    async getSimilar(idOrSlug: string, limit = 4): Promise<Listing[]> {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        let listing;

        if (isUuid) {
            listing = await this.listingRepository.findOne({
                where: { id: idOrSlug },
                select: ['id', 'categoryId'],
            });
        } else {
            listing = await this.listingRepository.findOne({
                where: { slug: idOrSlug },
                select: ['id', 'categoryId'],
            });
        }

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        return this.listingRepository.find({
            where: {
                categoryId: listing.categoryId,
                id: Not(listing.id), // Exclude current listing
                status: BusinessStatus.APPROVED,
            },
            take: Number(limit),
        });
    }

    /**
     * Update listing image URL
     */
    async updateImage(id: string, imageUrl: string, user: User): Promise<Listing> {
        const listing = await this.listingRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        // Check ownership
        if (listing.vendor.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Unauthorized access');
        }

        listing.coverImageUrl = imageUrl;
        await this.listingRepository.save(listing);

        return this.findOne(id);
    }

    /**
     * Get all available amenities
     */
    async getAllAmenities(): Promise<Amenity[]> {
        return this.amenityRepository.find({
            order: { name: 'ASC' },
        });
    }

    /**
     * Create a new amenity
     */
    async createAmenity(name: string, icon?: string): Promise<Amenity> {
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
}
