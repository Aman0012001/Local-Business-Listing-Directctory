import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEvent, OfferStatus } from '../../entities/offer-event.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { SearchOfferDto } from './dto/search-offer.dto';
import { Brackets } from 'typeorm';

@Injectable()
export class OffersService {
    constructor(
        @InjectRepository(OfferEvent)
        private offerRepository: Repository<OfferEvent>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
    ) { }

    /** Helper: recompute status from dates (same logic as entity hook, but for query results) */
    private computeStatus(offer: OfferEvent): OfferEvent {
        const now = new Date();
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

    /** Create a new offer/event */
    async create(userId: string, dto: CreateOfferDto): Promise<OfferEvent> {
        const vendor = await this.getVendorByUserId(userId);
        await this.verifyBusinessOwnership(dto.businessId, vendor.id);

        const offer = this.offerRepository.create({
            ...dto,
            vendorId: vendor.id,
            startDate: dto.startDate ? new Date(dto.startDate) : null,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
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

            const qb = this.offerRepository.createQueryBuilder('o')
                .leftJoinAndSelect('o.business', 'b')
                .leftJoinAndSelect('b.category', 'cat')
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

            if (isFeatured !== undefined) {
                qb.andWhere('o.isFeatured = :isFeatured', { isFeatured });
            }

            if (latitude && longitude) {
                const formula = `earth_distance(ll_to_earth(b.latitude, b.longitude), ll_to_earth(:lat, :lng))`;
                qb.addSelect(`${formula} / 1000`, 'distance');
                qb.setParameters({ lat: latitude, lng: longitude });

                if (radius) {
                    const radiusInMeters = radius * 1000;
                    qb.andWhere(`${formula} <= :radiusInMeters`, { radiusInMeters });
                }
                qb.orderBy('o.isFeatured', 'DESC');
                qb.addOrderBy('distance', 'ASC');
            } else {
                qb.orderBy('o.isFeatured', 'DESC');
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
            order: { createdAt: 'DESC' },
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

    /** Cron / scheduled task: mark expired offers */
    async expireStaleOffers(): Promise<number> {
        const now = new Date();
        const result = await this.offerRepository
            .createQueryBuilder()
            .update(OfferEvent)
            .set({ status: OfferStatus.EXPIRED })
            .where('expiry_date < :now', { now })
            .andWhere('status != :expired', { expired: OfferStatus.EXPIRED })
            .execute();
        return result.affected || 0;
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

