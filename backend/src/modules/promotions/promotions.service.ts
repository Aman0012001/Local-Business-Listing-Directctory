import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { PromotionPricingRule, PromotionPlacement } from '../../entities/promotion-pricing-rule.entity';
import { PromotionBooking, BookingStatus } from '../../entities/promotion-booking.entity';
import { OfferEvent, OfferType } from '../../entities/offer-event.entity';
import { Vendor } from '../../entities/vendor.entity';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CalculatePriceDto, CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class PromotionsService implements OnModuleInit {
    private readonly logger = new Logger(PromotionsService.name);
    private stripe: Stripe;

    constructor(
        @InjectRepository(PromotionPricingRule)
        private pricingRuleRepo: Repository<PromotionPricingRule>,
        @InjectRepository(PromotionBooking)
        private bookingRepo: Repository<PromotionBooking>,
        @InjectRepository(OfferEvent)
        private offerRepository: Repository<OfferEvent>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        private configService: ConfigService,
    ) {}

    onModuleInit() {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        this.stripe = new Stripe(apiKey || 'sk_test_not_configured', {
            apiVersion: '2026-02-25.clover' as any,
        });

        // Initialize default pricing rules if none exist
        this.seedDefaultRules();
    }

    private async seedDefaultRules() {
        const defaults = [
            { placement: PromotionPlacement.HOMEPAGE, pricePerHour: 100, pricePerDay: 2400 },
            { placement: PromotionPlacement.CATEGORY, pricePerHour: 70, pricePerDay: 1680 },
            { placement: PromotionPlacement.LISTING, pricePerHour: 50, pricePerDay: 1200 },
            { placement: PromotionPlacement.OFFER, pricePerHour: 40, pricePerDay: 960 },
            { placement: PromotionPlacement.EVENT, pricePerHour: 60, pricePerDay: 1440 },
            { placement: PromotionPlacement.PAGE, pricePerHour: 80, pricePerDay: 1920 },
        ];

        for (const ruleData of defaults) {
            const exists = await this.pricingRuleRepo.findOne({ where: { placement: ruleData.placement } });
            if (!exists) {
                this.logger.log(`Seeding missing default pricing rule: ${ruleData.placement}`);
                await this.pricingRuleRepo.save(ruleData);
            }
        }
    }

    /**
     * Get pricing rules for the frontend
     */
    async getPricingRules() {
        return this.pricingRuleRepo.find({ where: { isActive: true } });
    }

    async calculatePrice(dto: CalculatePriceDto, userId?: string, offerType: string = 'offer'): Promise<{ totalPrice: number; durationHours: number; breakup: any[] }> {
        let totalPrice = 0;
        const breakup = [];

        // 2. Add duration-based placement costs if applicable
        let durationHours = 0;
        if (dto.placements?.length > 0 && dto.startTime && dto.endTime) {
            const start = new Date(dto.startTime);
            const end = new Date(dto.endTime);
            if (start >= end) throw new BadRequestException('Start time must be before end time for boosts');

            const diffMs = end.getTime() - start.getTime();
            durationHours = Math.ceil(diffMs / (1000 * 60 * 60));
            const durationDays = Math.floor(durationHours / 24);
            const remainingHours = durationHours % 24;

            const rules = await this.pricingRuleRepo.find({ where: { placement: In(dto.placements) } });
            for (const rule of rules) {
                const hourRate = Number(rule.pricePerHour);
                const dayRate = Number(rule.pricePerDay);
                const placementTotal = (durationDays * dayRate) + (remainingHours * hourRate);
                
                totalPrice += placementTotal;
                breakup.push({
                    placement: rule.placement,
                    subtotal: placementTotal,
                    days: durationDays,
                    hours: remainingHours,
                    isBaseFee: false
                });
            }
        }

        return { totalPrice, durationHours, breakup };
    }

    /**
     * Create a pending booking and a Stripe Checkout session
     */
    async createBooking(userId: string, dto: CreateBookingDto, origin?: string) {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new NotFoundException('Vendor profile not found');

        const offer = await this.offerRepository.findOne({ where: { id: dto.offerEventId, vendorId: vendor.id } });
        if (!offer) throw new NotFoundException('Offer/Event not found');

        const pricing = await this.calculatePrice(dto, userId, offer.type);
        if (pricing.totalPrice === 0) {
            // Free promotion (if configured)
            return this.activateFreeBooking(vendor.id, offer, dto, pricing);
        }

        // 1. Save Pending Booking
        const booking = this.bookingRepo.create({
            vendorId: vendor.id,
            offerEventId: offer.id,
            type: offer.type,
            placements: dto.placements,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            durationHours: pricing.durationHours,
            totalPrice: pricing.totalPrice,
            status: BookingStatus.PENDING,
        });
        await this.bookingRepo.save(booking);

        // 2. Stripe Session
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || '';
        const allowedUrls = frontendUrl ? frontendUrl.split(',').map(url => url.trim()) : [];
        const baseUrl = allowedUrls[0] || origin || 'http://localhost:3000';

        const info = pricing.breakup.map(b => b.label || b.placement).join(', ');
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: vendor.businessEmail || undefined,
            client_reference_id: vendor.id,
            line_items: [{
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: `Promotion and Registration for ${offer.title}`,
                        description: `Fees: ${info}`,
                    },
                    unit_amount: Math.round(pricing.totalPrice * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            metadata: {
                bookingId: booking.id,
                type: 'promotion_booking'
            },
            success_url: `${baseUrl}/vendor/offers/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
            cancel_url:  `${baseUrl}/vendor/offers?canceled=true`,
        });

        booking.stripeSessionId = session.id;
        await this.bookingRepo.save(booking);

        return {
            sessionId: session.id,
            checkoutUrl: session.url,
            bookingId: booking.id
        };
    }

    private async activateFreeBooking(vendorId: string, offer: OfferEvent, dto: CreateBookingDto, pricing: any) {
        const booking = this.bookingRepo.create({
            vendorId,
            offerEventId: offer.id,
            type: offer.type,
            placements: dto.placements,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            durationHours: pricing.durationHours,
            totalPrice: 0,
            status: BookingStatus.ACTIVE,
        });
        await this.bookingRepo.save(booking);

        // Ensure the offer itself is active (if it was pending payment)
        if (!offer.isActive) {
            offer.isActive = true;
            await this.offerRepository.save(offer);
        }

        return { success: true, bookingId: booking.id };
    }

    /**
     * Verify and Activate Booking
     */
    async verifySession(sessionId: string, userId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid') {
                const bookingId = session.metadata.bookingId;
                const paymentIntentId = session.payment_intent as string;
                
                const result = await this.activateBooking(bookingId, paymentIntentId);
                return { success: true, ...result };
            }
            return { success: false, status: session.payment_status };
        } catch (error) {
            this.logger.error(`Failed to verify checkout session ${sessionId}:`, error);
            throw new BadRequestException(`Verification failed: ${error.message}`);
        }
    }

    /**
     * Activate a booking and sync with OfferEvent (called by Webhook or Manual Verification)
     */
    async activateBooking(bookingId: string, gatewayTransactionId: string) {
        const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status === BookingStatus.ACTIVE) {
            return { alreadyProcessed: true, booking };
        }

        // 1. Activate Booking
        booking.status = BookingStatus.ACTIVE;
        booking.paymentIntentId = gatewayTransactionId;
        await this.bookingRepo.save(booking);

        // 2. Sync with OfferEvent (Apply the Boost)
        const offer = await this.offerRepository.findOne({ where: { id: booking.offerEventId } });
        if (offer) {
            // All boosts make the offer active and featured
            offer.isActive = true;
            offer.isFeatured = true;
            
            // Set featuredUntil to the end of the booking duration
            if (!offer.featuredUntil || offer.featuredUntil < booking.endTime) {
                offer.featuredUntil = booking.endTime;
            }
            
            await this.offerRepository.save(offer);
            this.logger.log(`🚀 Boost activated for Offer: ${offer.title} until ${offer.featuredUntil}`);
        }

        return { success: true, booking, offer };
    }

    /**
     * Admin: Update pricing rules
     */
    async updatePricingRule(id: string, dto: { pricePerHour?: number, isActive?: boolean }) {
        const rule = await this.pricingRuleRepo.findOne({ where: { id } });
        if (!rule) throw new NotFoundException('Pricing rule not found');

        if (dto.pricePerHour !== undefined) {
            rule.pricePerHour = dto.pricePerHour;
            rule.pricePerDay = dto.pricePerHour * 24; // Sync day rate (24x hourly)
        }
        if (dto.isActive !== undefined) rule.isActive = dto.isActive;

        return this.pricingRuleRepo.save(rule);
    }

    /**
     * Expiration logic to be called by a cron job
     */
    async handleExpirations() {
        const now = new Date();
        const result = await this.bookingRepo
            .createQueryBuilder()
            .update(PromotionBooking)
            .set({ status: BookingStatus.EXPIRED })
            .where('status = :active', { active: BookingStatus.ACTIVE })
            .andWhere('endTime < :now', { now })
            .execute();
        
        return result.affected || 0;
    }

    /**
     * Get active bookings for a vendor
     */
    async getActiveBookingsByVendor(vendorId: string) {
        const now = new Date();
        return this.bookingRepo.find({
            where: {
                vendorId,
                status: BookingStatus.ACTIVE,
                endTime: MoreThan(now),
            },
            relations: ['offerEvent', 'offerEvent.business'],
            order: { endTime: 'ASC' },
        });
    }
}
