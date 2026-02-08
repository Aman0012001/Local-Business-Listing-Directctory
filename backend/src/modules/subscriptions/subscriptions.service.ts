import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Transaction, PaymentStatus } from '../../entities/transaction.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { CreatePlanDto, CheckoutDto } from './dto/subscription.dto';

import { ConfigService } from '@nestjs/config';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(SubscriptionPlan)
        private planRepository: Repository<SubscriptionPlan>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        private stripeService: StripeService,
        private configService: ConfigService,
    ) { }

    /**
     * Get all available subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        return this.planRepository.find({ where: { isActive: true }, order: { price: 'ASC' } });
    }

    /**
     * ADMIN: Create a new plan
     */
    async createPlan(createPlanDto: CreatePlanDto): Promise<SubscriptionPlan> {
        const plan = this.planRepository.create(createPlanDto);
        return this.planRepository.save(plan);
    }

    /**
     * Create a real Stripe checkout session
     */
    async createCheckoutSession(userId: string, checkoutDto: CheckoutDto) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user']
        });
        if (!vendor) throw new ForbiddenException('Only vendors can subscribe');

        const plan = await this.planRepository.findOne({ where: { id: checkoutDto.planId } });
        if (!plan) throw new NotFoundException('Plan not found');
        if (!plan.stripePriceId) throw new BadRequestException('This plan is not configured for Stripe payments');

        // 1. Ensure Stripe Customer exists
        let stripeCustomerId = vendor.stripeCustomerId;
        if (!stripeCustomerId) {
            if (this.configService.get('STRIPE_SECRET_KEY')) {
                const customer = await this.stripeService.createCustomer(vendor.user.email, vendor.businessName);
                stripeCustomerId = customer.id;
                vendor.stripeCustomerId = stripeCustomerId;
                await this.vendorRepository.save(vendor);
            } else {
                stripeCustomerId = 'MOCK-CUSTOMER-' + vendor.id;
            }
        }

        // 2. Create Checkout Session or Mock
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        if (!this.configService.get('STRIPE_SECRET_KEY')) {
            // Local Mode: Return mock success URL
            return {
                sessionId: 'MOCK-SESSION-' + Date.now(),
                checkoutUrl: `${frontendUrl}/vendor/subscription/success?session_id=MOCK-SESSION-${Date.now()}&mock_plan_id=${plan.id}`,
            };
        }

        const session = await this.stripeService.createCheckoutSession({
            customerId: stripeCustomerId,
            priceId: plan.stripePriceId,
            successUrl: `${frontendUrl}/vendor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${frontendUrl}/pricing`,
            metadata: {
                vendorId: vendor.id,
                planId: plan.id,
            },
        });

        return {
            sessionId: session.id,
            checkoutUrl: session.url,
        };
    }

    /**
     * Handle Stripe Subscription Success (Webhook logic)
     */
    async handleStripeSubscriptionSuccess(vendorId: string, planId: string, stripeSubscriptionId: string) {
        const plan = await this.planRepository.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');

        // Cancel old subscription if exists
        await this.subscriptionRepository.update(
            { vendorId, status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() }
        );

        // Retrieve subscription details from Stripe or Mock
        let stripeSub: any;
        if (stripeSubscriptionId.startsWith('MOCK-')) {
            // Local Mode: Mock subscription data
            const now = Math.floor(Date.now() / 1000);
            stripeSub = {
                current_period_start: now,
                current_period_end: now + 30 * 24 * 60 * 60, // 30 days
                cancel_at_period_end: false,
                latest_invoice: 'MOCK-INV-' + Date.now(),
                status: 'active',
            };
        } else {
            stripeSub = await this.stripeService.getSubscription(stripeSubscriptionId);
        }

        const subscription = this.subscriptionRepository.create({
            vendorId,
            planId,
            status: SubscriptionStatus.ACTIVE,
            stripeSubscriptionId,
            startDate: new Date(stripeSub.current_period_start * 1000),
            endDate: new Date(stripeSub.current_period_end * 1000),
            amount: plan.price,
            autoRenew: !stripeSub.cancel_at_period_end,
        });

        const savedSub = await this.subscriptionRepository.save(subscription);

        // Record transaction
        const transaction = this.transactionRepository.create({
            subscriptionId: savedSub.id,
            vendorId,
            amount: plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            gatewayTransactionId: stripeSub.latest_invoice as string,
            paymentGateway: 'Stripe',
            invoiceNumber: `INV-STR-${Date.now()}`,
        });

        await this.transactionRepository.save(transaction);

        return savedSub;
    }

    /**
     * Sync subscription details from Stripe
     */
    async syncStripeSubscription(stripeSubscriptionId: string) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { stripeSubscriptionId },
        });
        if (!subscription) return;

        const stripeSub = await this.stripeService.getSubscription(stripeSubscriptionId);

        subscription.endDate = new Date(stripeSub.current_period_end * 1000);
        subscription.autoRenew = !stripeSub.cancel_at_period_end;

        if (stripeSub.status === 'active') {
            subscription.status = SubscriptionStatus.ACTIVE;
        } else if (stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') {
            subscription.status = SubscriptionStatus.CANCELLED;
        }

        await this.subscriptionRepository.save(subscription);
    }

    /**
     * Cancel subscription locally when deleted on Stripe
     */
    async cancelStripeSubscription(stripeSubscriptionId: string) {
        await this.subscriptionRepository.update(
            { stripeSubscriptionId },
            {
                status: SubscriptionStatus.CANCELLED,
                cancelledAt: new Date()
            }
        );
    }

    /**
     * Get active subscription for vendor
     */
    async getActiveSubscription(userId: string): Promise<Subscription | null> {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException('Vendor not found');

        return this.subscriptionRepository.findOne({
            where: { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
            relations: ['plan'],
        });
    }

    /**
     * Get transaction history for vendor
     */
    async getTransactions(userId: string) {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException('Vendor not found');

        return this.transactionRepository.find({
            where: { vendorId: vendor.id },
            order: { createdAt: 'DESC' },
        });
    }
}
