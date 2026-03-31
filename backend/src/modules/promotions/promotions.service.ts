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
        const count = await this.pricingRuleRepo.count();
        if (count === 0) {
            this.logger.log('Seeding default promotion pricing rules...');
            const defaults = [
                { placement: PromotionPlacement.HOMEPAGE, pricePerHour: 100, pricePerDay: 2000 },
                { placement: PromotionPlacement.CATEGORY, pricePerHour: 70, pricePerDay: 1400 },
                { placement: PromotionPlacement.LISTING, pricePerHour: 50, pricePerDay: 1000 },
            ];
            await this.pricingRuleRepo.save(defaults);
        }
    }

    /**
     * Get pricing rules for the frontend
     */
    async getPricingRules() {
        return this.pricingRuleRepo.find({ where: { isActive: true } });
    }

    /**
     * Calculate price for a specific promotion configuration
     */
    async calculatePrice(dto: CalculatePriceDto): Promise<{ totalPrice: number; durationHours: number; breakup: any[] }> {
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);
        const now = new Date();

        if (start >= end) throw new BadRequestException('Start time must be before end time');
        // if (start < now) throw new BadRequestException('Start time cannot be in the past');

        const diffMs = end.getTime() - start.getTime();
        const durationHours = Math.ceil(diffMs / (1000 * 60 * 60));
        const durationDays = Math.floor(durationHours / 24);
        const remainingHours = durationHours % 24;

        const rules = await this.pricingRuleRepo.find({ where: { placement: In(dto.placements) } });
        let totalPrice = 0;
        const breakup = [];

        for (const rule of rules) {
            const dayPrice = Number(rule.pricePerDay) * durationDays;
            const hourPrice = Number(rule.pricePerHour) * remainingHours;
            const placementTotal = dayPrice + hourPrice;
            
            totalPrice += placementTotal;
            breakup.push({
                placement: rule.placement,
                dayRate: Number(rule.pricePerDay),
                hourRate: Number(rule.pricePerHour),
                days: durationDays,
                hours: remainingHours,
                subtotal: placementTotal,
            });
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

        const pricing = await this.calculatePrice(dto);
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

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: vendor.businessEmail || undefined,
            client_reference_id: vendor.id,
            line_items: [{
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: `Promotion for ${offer.title}`,
                        description: `Placements: ${dto.placements.join(', ')}`,
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
        return { success: true, bookingId: booking.id };
    }

    /**
     * Verify and Activate Booking
     */
    async verifySession(sessionId: string, userId: string) {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new NotFoundException('Vendor profile not found');

        const booking = await this.bookingRepo.findOne({ where: { stripeSessionId: sessionId, vendorId: vendor.id } });
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status === BookingStatus.ACTIVE) return { success: true, booking };

        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid' && session.metadata?.type === 'promotion_booking') {
                booking.status = BookingStatus.ACTIVE;
                booking.paymentIntentId = session.payment_intent as string;
                await this.bookingRepo.save(booking);
                
                // Note: We might want to sync some flags to OfferEvent for faster UI queries
                // (e.g. if it includes homepage placement, set isFeatured = true)
                // However, we can also use active bookings in the query builder.
                
                return { success: true, booking };
            }
            return { success: false, status: session.payment_status };
        } catch (error) {
            console.error(`Failed to verify checkout session ${sessionId}:`, error);
            throw new BadRequestException(`Verification failed`);
        }
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
