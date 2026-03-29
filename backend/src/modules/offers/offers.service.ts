import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEvent, OfferStatus } from '../../entities/offer-event.entity';
import { OfferEventPricing } from '../../entities/offer-event-pricing.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

import { SearchOfferDto } from './dto/search-offer.dto';
import { Brackets } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class OffersService implements OnModuleInit {
    constructor(
        @InjectRepository(OfferEvent)
        private offerRepository: Repository<OfferEvent>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @InjectRepository(OfferEventPricing)
        private pricingRepository: Repository<OfferEventPricing>,
        private configService: ConfigService,
    ) { }

    private stripe: Stripe;

    onModuleInit() {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!apiKey || apiKey === 'sk_test_your_secret_key_here') {
            console.error('❌ STRIPE_SECRET_KEY is missing! Offer payments will fail.');
        }

        this.stripe = new Stripe(apiKey || 'sk_test_not_configured', {
            apiVersion: '2026-02-25.clover' as any,
        });
    }

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
                if (isFeatured) {
                    qb.andWhere('(o.featured_until IS NULL OR o.featured_until > :now)', { now: new Date() });
                }
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

        // 1. Expire stale offers overall
        const result = await this.offerRepository
            .createQueryBuilder()
            .update(OfferEvent)
            .set({ status: OfferStatus.EXPIRED })
            .where('expiry_date < :now', { now })
            .andWhere('status != :expired', { expired: OfferStatus.EXPIRED })
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

    /**
     * Get available promotion pricing for offers/events
     */
    async getPricing(type?: 'offer' | 'event') {
        const query: any = { where: { isActive: true }, order: { price: 'ASC' } };
        if (type) {
            query.where.type = type;
        }
        return this.pricingRepository.find(query);
    }

    /** 
     * Create a Stripe Checkout session to feature an offer/event 
     */
    async createFeatureCheckoutSession(userId: string, offerId: string, pricingId: string) {
        const vendor = await this.getVendorByUserId(userId);
        const offer = await this.offerRepository.findOne({ where: { id: offerId, vendorId: vendor.id } });
        if (!offer) throw new NotFoundException('Offer not found');
        
        const plan = await this.pricingRepository.findOne({ where: { id: pricingId, isActive: true } });
        if (!plan) throw new NotFoundException('Pricing plan not found');

        // Free plan logic
        if (plan.price === 0) {
            await this.activateFeature(offer.id, plan.id);
            return {
                sessionId: `MOCK-${Date.now()}`,
                checkoutUrl: null,
            };
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const baseUrl = frontendUrl.split(',')[0].trim();

        const product = await this.stripe.products.create({ name: `Feature ${offer.type}: ${plan.name}` });
        const price = await this.stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(Number(plan.price) * 100),
            currency: 'usd',
        });

        // Resolve customer
        let customerId = vendor.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: vendor.businessEmail || undefined,
                name: vendor.businessName || undefined,
                metadata: { vendorId: vendor.id },
            });
            customerId = customer.id;
            vendor.stripeCustomerId = customerId;
            await this.vendorRepository.save(vendor);
        }

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            client_reference_id: vendor.id,
            line_items: [{ price: price.id, quantity: 1 }],
            mode: 'payment',
            metadata: {
                offerId: offer.id,
                pricingId: plan.id,
                type: 'feature_offer'
            },
            success_url: `${baseUrl}/vendor/offers/success?session_id={CHECKOUT_SESSION_ID}&offer_id=${offer.id}`,
            cancel_url:  `${baseUrl}/vendor/offers?canceled=true`,
        });

        return {
            sessionId: session.id,
            checkoutUrl: session.url,
        };
    }

    /**
     * Manually verify a checkout session
     */
    async verifyFeatureSession(sessionId: string, userId: string) {
        const vendor = await this.getVendorByUserId(userId);
        
        try {
            if (sessionId.startsWith('MOCK-')) {
                return { success: true };
            }

            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid' && session.metadata?.type === 'feature_offer') {
                const offerId = session.metadata.offerId;
                const pricingId = session.metadata.pricingId;
                
                const offer = await this.offerRepository.findOne({ where: { id: offerId, vendorId: vendor.id } });
                if (offer && !offer.isFeatured) {
                    await this.activateFeature(offer.id, pricingId);
                }
                return { success: true };
            }
            return { success: false, status: session.payment_status };
        } catch (error) {
            console.error(`Failed to verify checkout session ${sessionId}:`, error);
            throw new BadRequestException(`Verification failed`);
        }
    }

    /** Activate featured status based on plan */
    private async activateFeature(offerId: string, pricingId: string) {
        const offer = await this.offerRepository.findOne({ where: { id: offerId } });
        const plan = await this.pricingRepository.findOne({ where: { id: pricingId } });
        if (!offer || !plan) return;

        const now = new Date();
        const until = new Date(now);

        if (plan.unit === 'minutes') until.setMinutes(until.getMinutes() + plan.duration);
        else if (plan.unit === 'hours') until.setHours(until.getHours() + plan.duration);
        else if (plan.unit === 'days') until.setDate(until.getDate() + plan.duration);

        offer.isFeatured = true;
        offer.featuredUntil = until;
        offer.pricingId = pricingId;

        await this.offerRepository.save(offer);
    }
}

