import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Business, BusinessStatus } from '../../entities/business.entity';
import { BusinessHours, DayOfWeek } from '../../entities/business-hours.entity';
import { BusinessAmenity } from '../../entities/business-amenity.entity';
import { Amenity } from '../../entities/amenity.entity';
import { Category } from '../../entities/category.entity';
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

@Injectable()
export class BusinessesService {
    constructor(
        @InjectRepository(Business)
        private businessRepository: Repository<Business>,
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
    ) { }

    /**
     * Create a new business
     */
    async create(createBusinessDto: CreateBusinessDto, user: User): Promise<Business> {
        // Verify user is a vendor
        const vendor = await this.vendorRepository.findOne({
            where: { userId: user.id },
            relations: ['subscriptions'],
        });

        if (!vendor) {
            throw new ForbiddenException('Only vendors can create businesses');
        }

        // Verify category exists
        const category = await this.categoryRepository.findOne({
            where: { id: createBusinessDto.categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Generate unique slug
        const slug = generateUniqueSlug(createBusinessDto.name);

        // Create business
        const business = this.businessRepository.create({
            ...createBusinessDto,
            vendorId: vendor.id,
            slug,
            status: BusinessStatus.PENDING,
            // location: `SRID=4326;POINT(${createBusinessDto.longitude} ${createBusinessDto.latitude})`,
        });

        const savedBusiness = await this.businessRepository.save(business);

        // Create business hours if provided
        if (createBusinessDto.businessHours?.length) {
            const hours = createBusinessDto.businessHours.map((hour) =>
                this.businessHoursRepository.create({
                    businessId: savedBusiness.id,
                    ...hour,
                }),
            );
            await this.businessHoursRepository.save(hours);
        }

        // Create business amenities if provided
        if (createBusinessDto.amenityIds?.length) {
            const amenities = createBusinessDto.amenityIds.map((amenityId) =>
                this.businessAmenityRepository.create({
                    businessId: savedBusiness.id,
                    amenityId,
                }),
            );
            await this.businessAmenityRepository.save(amenities);
        }

        return this.findOne(savedBusiness.id);
    }

    /**
     * Search businesses with filters and geo-location
     */
    async search(searchDto: SearchBusinessDto) {
        const { page = 1, limit = 20, latitude, longitude, radius } = searchDto;
        const skip = calculateSkip(page, limit);

        const queryBuilder = this.businessRepository
            .createQueryBuilder('business')
            .leftJoinAndSelect('business.category', 'category')
            .leftJoinAndSelect('business.vendor', 'vendor')
            .leftJoinAndSelect('business.businessHours', 'businessHours')
            .leftJoinAndSelect('business.businessAmenities', 'businessAmenities')
            .leftJoinAndSelect('businessAmenities.amenity', 'amenity')
            .where('business.status = :status', { status: BusinessStatus.APPROVED });

        // Text search
        if (searchDto.query) {
            queryBuilder.andWhere(
                '(business.name ILIKE :query OR business.description ILIKE :query)',
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
        if (searchDto.city) {
            queryBuilder.andWhere('business.city ILIKE :city', {
                city: `%${searchDto.city}%`,
            });
        }

        // Rating filter
        if (searchDto.minRating) {
            queryBuilder.andWhere('business.averageRating >= :minRating', {
                minRating: searchDto.minRating,
            });
        }

        // Price range filter
        if (searchDto.priceRange) {
            queryBuilder.andWhere('business.priceRange = :priceRange', {
                priceRange: searchDto.priceRange,
            });
        }

        // Featured only
        if (searchDto.featuredOnly) {
            queryBuilder.andWhere('business.isFeatured = :featured', { featured: true });
        }

        // Verified only
        if (searchDto.verifiedOnly) {
            queryBuilder.andWhere('business.isVerified = :verified', { verified: true });
        }

        // Open Now filter
        if (searchDto.openNow) {
            const now = new Date();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = days[now.getDay()];
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            queryBuilder.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('bh.businessId')
                    .from(BusinessHours, 'bh')
                    .where('bh.dayOfWeek = :currentDay', { currentDay })
                    .andWhere('bh.isOpen = :isOpen', { isOpen: true })
                    .andWhere(':currentTime BETWEEN bh.openTime AND bh.closeTime', { currentTime })
                    .getQuery();
                return 'business.id IN ' + subQuery;
            });
        }

        /*
        // Geo-location filter
        if (latitude && longitude && radius) {
            queryBuilder.andWhere(
                `ST_DWithin(
          business.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radiusMeters
        )`,
                {
                    latitude,
                    longitude,
                    radiusMeters: radius * 1000, // Convert km to meters
                },
            );

            // Add distance calculation
            queryBuilder.addSelect(
                `ST_Distance(
          business.location::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        ) / 1000`,
                'distance',
            );
        }
        */

        // Sorting
        switch (searchDto.sortBy) {
            case SearchSortBy.DISTANCE:
                if (latitude && longitude) {
                    queryBuilder.orderBy('distance', 'ASC');
                }
                break;
            case SearchSortBy.RATING:
                queryBuilder.orderBy('business.averageRating', 'DESC');
                break;
            case SearchSortBy.NEWEST:
                queryBuilder.orderBy('business.createdAt', 'DESC');
                break;
            default:
                // Relevance (sponsored > featured > rating)
                queryBuilder
                    .orderBy('business.isSponsored', 'DESC')
                    .addOrderBy('business.isFeatured', 'DESC')
                    .addOrderBy('business.averageRating', 'DESC');
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const businesses = await queryBuilder.skip(skip).take(limit).getRawAndEntities();

        // Calculate distances if geo-location provided
        const results = businesses.entities.map((business, index) => {
            const result: any = business;
            if (latitude && longitude) {
                result.distance = businesses.raw[index]?.distance
                    ? parseFloat(businesses.raw[index].distance).toFixed(2)
                    : calculateDistance(latitude, longitude, business.latitude, business.longitude);
            }
            return result;
        });

        return createPaginatedResponse(results, page, limit, total);
    }

    /**
     * Get business by ID
     */
    async findOne(id: string): Promise<Business> {
        const business = await this.businessRepository.findOne({
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

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Increment view count
        await this.businessRepository.increment({ id }, 'totalViews', 1);

        return business;
    }

    /**
     * Get business by slug
     */
    async findBySlug(slug: string): Promise<Business> {
        const business = await this.businessRepository.findOne({
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

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Increment view count
        await this.businessRepository.increment({ id: business.id }, 'totalViews', 1);

        return business;
    }

    /**
     * Update business
     */
    async update(
        id: string,
        updateBusinessDto: UpdateBusinessDto,
        user: User,
    ): Promise<Business> {
        const business = await this.businessRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Check ownership
        if (business.vendor.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only update your own businesses');
        }

        // Update slug if name changed
        if (updateBusinessDto.name && updateBusinessDto.name !== business.name) {
            updateBusinessDto['slug'] = generateUniqueSlug(updateBusinessDto.name);
        }

        /*
        // Update location if coordinates changed
        if (updateBusinessDto.latitude && updateBusinessDto.longitude) {
            updateBusinessDto['location'] = `SRID=4326;POINT(${updateBusinessDto.longitude} ${updateBusinessDto.latitude})`;
        }
        */

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

        await this.businessRepository.update(id, updateData);

        return this.findOne(id);
    }

    /**
     * Delete business
     */
    async remove(id: string, user: User): Promise<void> {
        const business = await this.businessRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Check ownership
        if (business.vendor.userId !== user.id && user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('You can only delete your own businesses');
        }

        await this.businessRepository.remove(business);
    }

    /**
     * Get vendor's businesses
     */
    async getVendorBusinesses(userId: string, page = 1, limit = 20) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        const skip = calculateSkip(page, limit);

        const [businesses, total] = await this.businessRepository.findAndCount({
            where: { vendorId: vendor.id },
            relations: ['category'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return createPaginatedResponse(businesses, page, limit, total);
    }

    /**
     * Get similar businesses (same category)
     */
    async getSimilar(idOrSlug: string, limit = 4): Promise<Business[]> {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        let business;

        if (isUuid) {
            business = await this.businessRepository.findOne({
                where: { id: idOrSlug },
                select: ['id', 'categoryId'],
            });
        } else {
            business = await this.businessRepository.findOne({
                where: { slug: idOrSlug },
                select: ['id', 'categoryId'],
            });
        }

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        return this.businessRepository.find({
            where: {
                categoryId: business.categoryId,
                status: BusinessStatus.APPROVED,
            },
            take: Number(limit),
        });
    }
}
