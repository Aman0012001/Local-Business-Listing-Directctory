import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { OfferEvent, OfferStatus, OfferType } from '../../entities/offer-event.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { PromotionBooking, BookingStatus } from '../../entities/promotion-booking.entity';

import { SearchOfferDto } from './dto/search-offer.dto';
import { Brackets } from 'typeorm';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class OffersService {
    constructor(
        @InjectRepository(OfferEvent)
        private offerRepository: Repository<OfferEvent>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @Inject(forwardRef(() => SubscriptionsService))
        private subscriptionsService: any,
    ) { }


    /** Helper: recompute status from dates (same logic as entity hook, but for query results) */    private computeStatus(offer: OfferEvent): OfferEvent {
        const now = new Date();
        if (offer.featuredUntil && now > new Date(offer.featuredUntil)) {
            offer.isFeatured = false;
        }

        if (offer.startDate && now < new Date(offer.startDate)) {
            offer.status = OfferStatus.SCHEDULED;
        } else if (offer.expiryDate && now > new Date(offer.expiryDate)) {
            offer.status = OfferStatus.EXPIRED;
        } else {
            offer.status = OfferStatus.ACTIVE;
        }
        return offer;
    }

    /** Resolve the vendor record for a given userId */
    private async getVendorByUserId(userId: string): Promise<Vendor> {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new NotFoundException('Vendor profile not found');
        return vendor;
    }

    /** Verify that a business belongs to the authenticated vendor */
    private async verifyBusinessOwnership(businessId: string, vendorId: string): Promise<Listing> {
        const listing = await this.listingRepository.findOne({ where: { id: businessId } });
        if (!listing) throw new NotFoundException('Business not found');
        if (listing.vendorId !== vendorId) {
            throw new ForbiddenException('You do not own this business listing');
        }
        return listing;
    }

    /** Helper: Validate that the requested duration does not exceed plan limits */
    private validateOfferDuration(dto: CreateOfferDto | UpdateOfferDto, activeSub: any) {
        const type = dto.type || OfferType.OFFER;
        const features = activeSub.plan?.dashboardFeatures || activeSub.plan?.features || {};
        
        const durationLimitKey = type === OfferType.EVENT ? 'maxEventDurationDays' : 'maxOfferDurationDays';
        // Default fallbacks if keys are missing from older plans
        const maxDays = features[durationLimitKey] || (type === OfferType.EVENT ? 7 : 15);

        const startDateStr = dto.startDate;
        const endDateStr = dto.endDate || dto.expiryDate;

        if (startDateStr && endDateStr) {
            const start = new Date(startDateStr);
            const end = new Date(endDateStr);
            
            const diffMs = end.getTime() - start.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays > maxDays) {
                throw new BadRequestException(
                    `The selected duration (${diffDays} days) exceeds your ${activeSub.plan.name} plan limit of ${maxDays} days for ${type}s.`
                );
            }
        }
    }

    /** Create a new offer/event */
    async create(userId: string, dto: CreateOfferDto): Promise<OfferEvent> {
        const vendor = await this.getVendorByUserId(userId);
        await this.verifyBusinessOwnership(dto.businessId, vendor.id);

        // --- Plan-based Gating ---
        const activeSub = await this.subscriptionsService.getActiveSubscription(userId);
        if (!activeSub || !activeSub.plan) {
            throw new BadRequestException('No active subscription found. Please purchase a plan to create offers or events.');
        }

        const features = activeSub.plan.features || {};
        const type = dto.type || OfferType.OFFER;
        const limitKey = type === OfferType.EVENT ? 'maxEvents' : 'maxOffers';
        const limit = features[limitKey] !== undefined ? Number(features[limitKey]) : 0;

        if (limit <= 0 && !dto.pricingId) {
            throw new ForbiddenException(`Your current plan (${activeSub.plan.name}) does not allow creating ${type}s. Please upgrade your plan.`);
        }

        // Count current non-expired entries of this type
        const currentCount = await this.offerRepository.count({
            where: {
                vendorId: vendor.id,
                type: type,
                status: Not(OfferStatus.EXPIRED)
            }
        });

        if (currentCount >= limit && !dto.pricingId) {
            throw new BadRequestException(
                `You have reached the limit of ${limit} ${type}s for your ${activeSub.plan.name} plan. Please upgrade or delete an existing ${type}.`
            );
        }

        // Validate Duration
        this.validateOfferDuration(dto, activeSub);

        const offer = this.offerRepository.create({
            ...dto,
            vendorId: vendor.id,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
            isActive: false, // Wait for promotion check / activation
        });

        // computeStatus is called via @BeforeInsert on the entity
        return this.offerRepository.save(offer);
    }

    /** Get all offers for the authenticated vendor (paginated) */
    async findByVendor(userId: string, page = 1, limit = 10) {
        const vendor = await this.getVendorByUserId(userId);
        const skip = (Number(page) - 1) * Number(limit);

        const [offers, total] = await this.offerRepository.findAndCount({
            where: { vendorId: vendor.id },
            relations: ['business'],
            order: { createdAt: 'DESC' },
            skip,
            take: Number(limit),
        });

        // Recompute status on retrieval (clock may have advanced)
        const withStatus = offers.map(o => this.computeStatus(o));

        return {
            data: withStatus,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }

    /** Public search for offers and events with filters */
    async findAllPublic(dto: SearchOfferDto) {
        try {
            const { query, city, latitude, longitude, radius, type, categoryId, isFeatured, limit = 10, page = 1 } = dto;
            const skip = (Number(page) - 1) * Number(limit);
            const now = new Date();

            const qb = this.offerRepository.createQueryBuilder('o')
                .leftJoinAndSelect('o.business', 'b')
                .leftJoinAndSelect('b.category', 'cat')
                // Join with active promotions
                .leftJoin('promotion_bookings', 'pb', 'pb.offer_event_id = o.id AND pb.status = :activeStatus AND pb.start_time <= :now AND pb.end_time > :now', {
                    activeStatus: BookingStatus.ACTIVE,
                    now
                })
                .where('o.isActive = :isActive', { isActive: true })
                .andWhere('o.status != :expired', { expired: OfferStatus.EXPIRED });

            if (query) {
                qb.andWhere(new Brackets(inner => {
                    inner.where('LOWER(o.title) LIKE :query', { query: `%${query.toLowerCase()}%` })
                        .orWhere('LOWER(o.description) LIKE :query', { query: `%${query.toLowerCase()}%` })
                        .orWhere('LOWER(b.title) LIKE :query', { query: `%${query.toLowerCase()}%` });
                }));
            }

            if (city) {
                qb.andWhere('LOWER(b.city) = :city', { city: city.toLowerCase() });
            }

            if (type) {
                qb.andWhere('o.type = :type', { type });
            }

            if (categoryId) {
                qb.andWhere('b.categoryId = :categoryId', { categoryId });
            }

            // Placement logic
            if (isFeatured === true) {
                // Return only featured (either via old boolean or new booking 'homepage' or 'category')
                qb.andWhere('(o.isFeatured = :trueVal OR pb.placements @> :hp OR pb.placements @> :catP)', {
                    trueVal: true,
                    hp: JSON.stringify(['homepage']),
                    catP: JSON.stringify(['category'])
                });
            }

            // Ranking & Ordering
            // 1. New Booking Boost (Listing placement)
            qb.addSelect("CASE WHEN pb.placements @> :listingP THEN 1 ELSE 0 END", "boosted");
            qb.setParameters({ listingP: JSON.stringify(['listing']) });

            if (latitude && longitude) {
                const formula = `earth_distance(ll_to_earth(b.latitude, b.longitude), ll_to_earth(:lat, :lng))`;
                qb.addSelect(`${formula} / 1000`, 'distance');
                qb.setParameters({ lat: latitude, lng: longitude });

                if (radius) {
                    const radiusInMeters = radius * 1000;
                    qb.andWhere(`${formula} <= :radiusInMeters`, { radiusInMeters });
                }
                qb.orderBy('boosted', 'DESC');
                qb.addOrderBy('o.isFeatured', 'DESC');
                qb.addOrderBy('distance', 'ASC');
            } else {
                qb.orderBy('boosted', 'DESC');
                qb.addOrderBy('o.isFeatured', 'DESC');
                qb.addOrderBy('o.createdAt', 'DESC');
            }

            const [offers, total] = await qb
                .skip(skip)
                .take(Number(limit))
                .getManyAndCount();

            const withStatus = offers.map(o => this.computeStatus(o));

            return {
                data: withStatus,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                },
            };
        } catch (error) {
            console.error('Error in findAllPublic:', error);
            throw error;
        }
    }

    /** Update an existing offer (vendor-scoped) */
    async update(id: string, userId: string, dto: UpdateOfferDto): Promise<OfferEvent> {
        const vendor = await this.getVendorByUserId(userId);
        const offer = await this.offerRepository.findOne({ where: { id } });
        if (!offer) throw new NotFoundException('Offer not found');
        if (offer.vendorId !== vendor.id) throw new ForbiddenException('You do not own this offer');

        if (dto.businessId && dto.businessId !== offer.businessId) {
            await this.verifyBusinessOwnership(dto.businessId, vendor.id);
        }

        // Validate Duration on Update
        const activeSub = await this.subscriptionsService.getActiveSubscription(userId);
        if (activeSub && activeSub.plan) {
            // Merge existing dates with updates for validation
            const validationDto = {
                ...dto,
                type: dto.type || offer.type,
                startDate: dto.startDate || offer.startDate?.toISOString(),
                endDate: dto.endDate || offer.endDate?.toISOString() || offer.expiryDate?.toISOString(),
            };
            this.validateOfferDuration(validationDto as any, activeSub);
        }

        Object.assign(offer, {
            ...dto,
            startDate: dto.startDate ? new Date(dto.startDate) : offer.startDate,
            endDate: dto.endDate ? new Date(dto.endDate) : offer.endDate,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : offer.expiryDate,
        });

        // @BeforeUpdate will recompute status
        return this.offerRepository.save(offer);
    }

    /** Delete an offer (vendor-scoped) */
    async remove(id: string, userId: string): Promise<void> {
        const vendor = await this.getVendorByUserId(userId);
        const offer = await this.offerRepository.findOne({ where: { id } });
        if (!offer) throw new NotFoundException('Offer not found');
        if (offer.vendorId !== vendor.id) throw new ForbiddenException('You do not own this offer');
        await this.offerRepository.remove(offer);
    }

    /** Public: get active/scheduled offers for a business (max 6) */
    async findPublicByBusiness(businessId: string): Promise<OfferEvent[]> {
        const offers = await this.offerRepository.find({
            where: { businessId, isActive: true },
            order: { isFeatured: 'DESC', createdAt: 'DESC' },
            take: 10, // fetch a few extra then filter
        });

        // Filter to only active/scheduled, recompute status
        return offers
            .map(o => this.computeStatus(o))
            .filter(o => o.status !== OfferStatus.EXPIRED)
            .slice(0, 6);
    }

    /** Public: get a single offer/event by ID */
    async findOnePublic(id: string): Promise<OfferEvent> {
        const offer = await this.offerRepository.findOne({
            where: { id, isActive: true },
            relations: ['business', 'business.category', 'business.vendor'],
        });

        if (!offer) {
            throw new NotFoundException('Offer or Event not found');
        }

        return this.computeStatus(offer);
    }

    /** Cron / scheduled task: mark expired offers AND clear expired featured status */
    async expireStaleOffers(): Promise<number> {
        const now = new Date();
        let affected = 0;

        // 1. Physically delete stale offers from the database
        const result = await this.offerRepository
            .createQueryBuilder()
            .delete()
            .from(OfferEvent)
            .where('expiry_date < :now', { now })
            .execute();
        
        affected += result.affected || 0;

        // 2. Un-feature expired featured offers
        const featureResult = await this.offerRepository
            .createQueryBuilder()
            .update(OfferEvent)
            .set({ isFeatured: false })
            .where('featured_until < :now', { now })
            .andWhere('is_featured = :trueVal', { trueVal: true })
            .execute();

        affected += featureResult.affected || 0;
        return affected;
    }

    /** Admin: Toggle featured status */
    async toggleFeatured(id: string, isFeatured: boolean): Promise<OfferEvent> {
        const offer = await this.offerRepository.findOne({ where: { id } });
        if (!offer) throw new NotFoundException('Offer not found');
        offer.isFeatured = isFeatured;
        return this.offerRepository.save(offer);
    }

    /** Admin: Get all offers for management */
    async findAllForAdmin(page = 1, limit = 20) {
        const skip = (Number(page) - 1) * Number(limit);
        const [offers, total] = await this.offerRepository.findAndCount({
            relations: ['business', 'vendor', 'vendor.user'],
            order: { createdAt: 'DESC' },
            skip,
            take: Number(limit),
        });

        return {
            data: offers.map(o => this.computeStatus(o)),
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }

}
