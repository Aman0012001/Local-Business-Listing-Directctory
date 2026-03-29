import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { PricingPlan, PricingPlanType, PricingPlanUnit } from '../../entities/pricing-plan.entity';
import { ActivePlan, ActivePlanStatus } from '../../entities/active-plan.entity';
import { Transaction, PaymentStatus } from '../../entities/transaction.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { Listing } from '../../entities/business.entity';
import { AffiliateReferral, ReferralStatus, ReferralType } from '../../entities/referral.entity';
import { Affiliate } from '../../entities/affiliate.entity';
import { CreatePlanDto, UpdatePlanDto, CheckoutDto, AssignPlanDto, CreateOfferPlanDto, UpdateOfferPlanDto } from './dto/subscription.dto';
import { OfferEventPricing } from '../../entities/offer-event-pricing.entity';

import { ConfigService } from '@nestjs/config';
import { AffiliateService } from '../affiliate/affiliate.service';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionsService implements OnModuleInit {
    private readonly logger = new Logger(SubscriptionsService.name);
    private stripe: Stripe;
    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(SubscriptionPlan)
        private planRepository: Repository<SubscriptionPlan>,
        @InjectRepository(PricingPlan)
        private pricingPlanRepository: Repository<PricingPlan>,
        @InjectRepository(ActivePlan)
        private activePlanRepository: Repository<ActivePlan>,
        @InjectRepository(Listing)
        private listingRepo: Repository<Listing>,
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(AffiliateReferral)
        private referralRepository: Repository<AffiliateReferral>,
        @InjectRepository(Affiliate)
        private affiliateRepository: Repository<Affiliate>,
        @InjectRepository(OfferEventPricing)
        private offerPricingRepository: Repository<OfferEventPricing>,
        private configService: ConfigService,
        private affiliateService: AffiliateService,
    ) {}

    onModuleInit() {
        const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!apiKey || apiKey === 'sk_test_your_secret_key_here') {
            this.logger.error('❌ STRIPE_SECRET_KEY is missing or invalid! Stripe features will be disabled. Please set this in your .env or Railway dashboard.');
        }

        // We use a dummy key if the real one is missing to prevent the Stripe constructor from throwing an error.
        // This allows the NestJS application to start successfully even without Stripe configured.
        this.stripe = new Stripe(apiKey || 'sk_test_not_configured', {
            apiVersion: '2026-02-25.clover' as any,
        });
    }

    /**
     * Get all available subscription plans (Client)
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        return this.planRepository.find({ where: { isActive: true }, order: { price: 'ASC' } });
    }

    /**
     * ADMIN: Get all plans including inactive ones
     */
    async getPlansForAdmin(): Promise<SubscriptionPlan[]> {
        return this.planRepository.find({ order: { price: 'ASC' } });
    }

    /**
     * ADMIN: Get plan by ID
     */
    async getPlanById(id: string): Promise<SubscriptionPlan> {
        const plan = await this.planRepository.findOne({ where: { id } });
        if (!plan) throw new NotFoundException('Plan not found');
        return plan;
    }

    /**
     * ADMIN: Create a new plan
     */
    async createPlan(createPlanDto: CreatePlanDto): Promise<SubscriptionPlan> {
        const plan = this.planRepository.create(createPlanDto);
        return this.planRepository.save(plan);
    }

    /**
     * ADMIN: Update a plan
     */
    async updatePlan(id: string, updatePlanDto: UpdatePlanDto): Promise<SubscriptionPlan> {
        const plan = await this.getPlanById(id);
        Object.assign(plan, updatePlanDto);
        return this.planRepository.save(plan);
    }

    /**
     * ADMIN: Delete a plan
     */
    async deletePlan(id: string): Promise<void> {
        const plan = await this.getPlanById(id);
        await this.planRepository.remove(plan);
    }

    /**
     * ADMIN: Get all subscriptions (paginated)
     */
    async getAllSubscriptionsForAdmin(page = 1, limit = 20): Promise<{ data: Subscription[]; total: number }> {
        const [data, total] = await this.subscriptionRepository.findAndCount({
            relations: ['plan', 'vendor', 'vendor.user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }

    /**
     * ADMIN: Get all transactions (paginated)
     */
    async getAllTransactionsForAdmin(page = 1, limit = 20): Promise<{ data: Transaction[]; total: number }> {
        const [data, total] = await this.transactionRepository.findAndCount({
            relations: ['vendor', 'vendor.user', 'subscription', 'subscription.plan'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }

    /**
     * ADMIN: Assign a plan to a vendor manually
     */
    async assignPlanToVendor(dto: AssignPlanDto): Promise<Subscription> {
        const plan = await this.planRepository.findOne({ where: { id: dto.planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const vendor = await this.vendorRepository.findOne({ where: { id: dto.vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');

        // Cancel existing active subscription
        await this.subscriptionRepository.update(
            { vendorId: dto.vendorId, status: SubscriptionStatus.ACTIVE },
            { 
                status: SubscriptionStatus.CANCELLED, 
                cancelledAt: new Date(),
                cancellationReason: 'Cancelled to assign new plan'
            }
        );

        const now = new Date();
        const endDate = new Date(now);

        // If specific duration is provided, use it (backward compatibility for admin tool)
        if (dto.durationDays) {
            endDate.setTime(now.getTime() + dto.durationDays * 24 * 60 * 60 * 1000);
        } else {
            // Otherwise use the plan's defined billing cycle for a "perfect" calendar date
            if (plan.billingCycle?.toLowerCase() === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                // Default to monthly (1 month from now)
                endDate.setMonth(endDate.getMonth() + 1);
            }
        }

        const subscription = this.subscriptionRepository.create({
            vendorId: dto.vendorId,
            planId: dto.planId,
            status: SubscriptionStatus.ACTIVE,
            startDate: now,
            endDate,
            amount: plan.price,
            autoRenew: false,
        });

        const savedSub = await this.subscriptionRepository.save(subscription);

        // Generate invoice number
        const invoiceNumber = `INV-ADMIN-${Date.now()}`;

        // Record transaction
        const transaction = this.transactionRepository.create({
            subscriptionId: savedSub.id,
            vendorId: dto.vendorId,
            amount: plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId: `ADMIN-ASSIGN-${Date.now()}`,
            paymentGateway: 'Admin',
            invoiceNumber,
        });

        await this.transactionRepository.save(transaction);

        return savedSub;
    }

    /**
     * ADMIN: Cancel a subscription
     */
    async cancelSubscriptionAdmin(subscriptionId: string): Promise<Subscription> {
        const sub = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });
        if (!sub) throw new NotFoundException('Subscription not found');

        await this.subscriptionRepository.update(subscriptionId, {
            status: SubscriptionStatus.CANCELLED,
            cancelledAt: new Date(),
            cancellationReason: 'Cancelled by admin',
            autoRenew: false,
        });

        // Fetch back updated subscription with relations if needed
        const updatedSub = await this.subscriptionRepository.findOne({ 
            where: { id: subscriptionId },
            relations: ['plan', 'vendor']
        });
        
        return updatedSub;
    }

    /**
     * Create a Stripe Checkout session for a vendor subscription.
     * Handles stale customer IDs gracefully by auto-recreating the Stripe customer.
     */
    async createCheckoutSession(userId: string, checkoutDto: CheckoutDto) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user']
        });
        if (!vendor) throw new ForbiddenException('Only vendors can subscribe');

        const plan = await this.planRepository.findOne({ where: { id: checkoutDto.planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        // Free plan — no Stripe involved
        if (plan.price === 0) {
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
            const mockId = `MOCK-FREE-${Date.now()}`;
            // Auto-activate free plan inline
            await this.handleMockSubscriptionSuccess(vendor.id, plan.id, mockId);
            return {
                sessionId: mockId,
                checkoutUrl: null,   // null = frontend stays on page and shows success message
            };
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        // Use only the first URL if FRONTEND_URL is a comma-separated list
        const baseUrl = frontendUrl.split(',')[0].trim();

        // ── Ensure plan has a valid Stripe Price ID (matching the current price) ────────────────
        let needsNewPrice = !plan.stripePriceId;
        
        if (plan.stripePriceId) {
            try {
                // Check if the price exists on Stripe and matches our current plan price
                const stripePrice = await this.stripe.prices.retrieve(plan.stripePriceId);
                const currentAmount = Math.round(Number(plan.price) * 100);
                
                if (stripePrice.unit_amount !== currentAmount || !stripePrice.active) {
                    this.logger.warn(`Stripe price ${plan.stripePriceId} mismatch (Active: ${stripePrice.active}, Amount: ${stripePrice.unit_amount} vs Expected: ${currentAmount}). Regenerating...`);
                    needsNewPrice = true;
                }
            } catch (err: any) {
                this.logger.error(`Failed to verify Stripe price ${plan.stripePriceId}: ${err.message}. Regenerating...`);
                needsNewPrice = true;
            }
        }

        if (needsNewPrice) {
            this.logger.log(`Syncing plan "${plan.name}" price with Stripe...`);
            const product = await this.stripe.products.create({ name: plan.name });
            const price = await this.stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(Number(plan.price) * 100),
                currency: 'pkr',
                recurring: { interval: plan.billingCycle.toLowerCase() === 'yearly' ? 'year' : 'month' },
            });
            plan.stripePriceId = price.id;
            await this.planRepository.save(plan);
            this.logger.log(`Created fresh Stripe price ${price.id} for plan "${plan.name}" at PKR ${plan.price}`);
        }

        // ── Resolve Stripe Customer ID ─────────────────────────────────────
        // The stored ID may be stale (e.g., from a different Stripe account/environment).
        // Try to retrieve it first; if Stripe says it doesn't exist, create a fresh one.
        let customerId = vendor.stripeCustomerId;

        if (customerId) {
            try {
                // Synchronize customer details with Stripe
                await this.stripe.customers.update(customerId, {
                    email: vendor.businessEmail || vendor.user?.email,
                    name: vendor.businessName || vendor.user?.fullName,
                    phone: vendor.businessPhone || vendor.user?.phone || undefined,
                    address: { country: 'PK' },
                });
                this.logger.log(`Synchronized Stripe customer ${customerId} for vendor ${vendor.id}`);
            } catch (err: any) {
                if (err?.code === 'resource_missing' || err?.message?.includes('No such customer')) {
                    this.logger.warn(
                        `Stale Stripe customer ID "${customerId}" for vendor ${vendor.id} — clearing and recreating.`
                    );
                    customerId = null;
                    vendor.stripeCustomerId = null;
                    await this.vendorRepository.save(vendor);
                } else {
                    // Log but don't crash if update fails (e.g. rate limit)
                    this.logger.error(`Failed to update Stripe customer ${customerId}: ${err.message}`);
                }
            }
        }

        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: vendor.businessEmail || vendor.user?.email,
                name: vendor.businessName || vendor.user?.fullName,
                phone: vendor.businessPhone || vendor.user?.phone,
                address: {
                    country: 'PK', // Default to Pakistan
                },
                metadata: { vendorId: vendor.id },
            });
            customerId = customer.id;
            vendor.stripeCustomerId = customerId;
            await this.vendorRepository.save(vendor);
            this.logger.log(`Created new Stripe customer ${customerId} for vendor ${vendor.id}`);
        }

        // ── Create Checkout Session ────────────────────────────────────────
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            customer_update: {
                address: 'auto',
                name: 'auto',
            },
            client_reference_id: vendor.id,
            billing_address_collection: 'required',
            phone_number_collection: { enabled: true },
            locale: 'en',
            line_items: [{ price: plan.stripePriceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${baseUrl}/vendor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${baseUrl}/vendor/subscription?canceled=true`,
        });

        this.logger.log(`Stripe checkout session created: ${session.id} for vendor ${vendor.id}`);

        return {
            sessionId: session.id,
            checkoutUrl: session.url,
        };
    }

    /**
     * Manually verify a checkout session to handle cases where the webhook is missed
     */
    async verifyCheckoutSession(sessionId: string, userId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            
            if (session.payment_status === 'paid') {
                // Check if we already processed it
                const existingTransaction = await this.transactionRepository.findOne({
                    where: { gatewayTransactionId: session.id }
                });

                if (existingTransaction) {
                    return { alreadyProcessed: true };
                }

                if (session.mode === 'subscription') {
                    const vendorId = session.client_reference_id;
                    if (session.subscription && vendorId) {
                        const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
                        const priceId = subscription.items.data[0].price.id;
                        
                        const plan = await this.planRepository.findOne({ where: { stripePriceId: priceId } });
                        if (plan) {
                            await this.processSubscriptionSuccess(vendorId, plan.id, session.id, 'Stripe');
                            return { success: true };
                        }
                    }
                }
            }
            return { success: false, status: session.payment_status };
        } catch (error) {
            this.logger.error(`Failed to verify checkout session ${sessionId}: ${error.message}`);
            throw new BadRequestException(`Verification failed: ${error.message}`);
        }
    }

    /**
     * Core logic to activate a subscription and record a transaction (invoice).
     * Used by mock success, admin assignment, and Stripe webhooks.
     */
    async processSubscriptionSuccess(
        vendorId: string,
        planId: string,
        gatewayTransactionId: string,
        gateway: 'Stripe' | 'Mock' | 'Admin',
        amount?: number
    ) {
        const plan = await this.planRepository.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');

        // Check for an existing ACTIVE subscription of the SAME plan to extend it (RECHARGE)
        const activeSub = await this.subscriptionRepository.findOne({
            where: { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE, planId: planId },
            relations: ['plan']
        });

        const now = new Date();
        let savedSub: Subscription;

        if (activeSub) {
            this.logger.log(`🔄 Extending existing active "${activeSub.plan.name}" plan for vendor ${vendor.id}`);
            
            // "Perfectly" extend the existing plan (recharge)
            const currentEndDate = new Date(activeSub.endDate);
            // If the plan is still active and valid, start adding from the current end date.
            // If current end date is in the past, start from "now".
            const baseDate = currentEndDate > now ? currentEndDate : now;
            const newEndDate = new Date(baseDate);

            if (plan.billingCycle?.toLowerCase() === 'yearly') {
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            } else {
                // Default to monthly - adds exactly one calendar month from expiration
                newEndDate.setMonth(newEndDate.getMonth() + 1);
            }

            activeSub.endDate = newEndDate;
            activeSub.amount = amount ?? plan.price;
            activeSub.autoRenew = gateway === 'Stripe';
            savedSub = await this.subscriptionRepository.save(activeSub);
        } else {
            // New subscription or switching plans - cancel previous active ones first
            await this.subscriptionRepository.update(
                { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
                { status: SubscriptionStatus.CANCELLED, cancelledAt: now }
            );

            // Calculate "perfect" end date for new plan
            const endDate = new Date(now);
            if (plan.billingCycle?.toLowerCase() === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            // Create new Subscription record
            const subscription = this.subscriptionRepository.create({
                vendorId: vendor.id,
                planId,
                status: SubscriptionStatus.ACTIVE,
                startDate: now,
                endDate,
                amount: amount ?? plan.price,
                autoRenew: gateway === 'Stripe', // Auto-renew only for Stripe
            });

            savedSub = await this.subscriptionRepository.save(subscription);
        }

        // 3. Generate Invoice Number
        const prefix = gateway === 'Stripe' ? 'INV-STRIPE' : gateway === 'Admin' ? 'INV-ADMIN' : 'INV-MOCK';
        const invoiceNumber = `${prefix}-${Date.now().toString().slice(-8)}`;

        // 4. Record Transaction (Invoice)
        const transaction = this.transactionRepository.create({
            subscriptionId: savedSub.id,
            vendorId: vendor.id,
            amount: amount ?? plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId,
            paymentGateway: gateway,
            invoiceNumber,
        });

        await this.transactionRepository.save(transaction);

        // 5. Affiliate Integration
        const referral = await this.referralRepository.findOne({
            where: [
                { referredUserId: vendor.userId, status: ReferralStatus.PENDING, type: ReferralType.SIGNUP },
                { referredUserId: vendor.userId, status: ReferralStatus.PENDING, type: ReferralType.SUBSCRIPTION }
            ],
            order: { createdAt: 'DESC' }
        });

        if (referral) {
            referral.type = ReferralType.SUBSCRIPTION;
            await this.referralRepository.save(referral);
            this.logger.log(`Affiliate referral ${referral.id} for user ${vendor.userId} is now AWAITING ADMIN ACTIVATION`);
        }

        this.logger.log(`✅ Subscription [${savedSub.id}] activated/extended for vendor [${vendor.id}] via ${gateway} until ${savedSub.endDate.toDateString()}`);
        return savedSub;
    }

    /**
     * Handle Mock Subscription Success (Legacy/Testing)
     */
    async handleMockSubscriptionSuccess(vendorIdOrUserId: string, planId: string, mockSessionId: string) {
        let vendor = await this.vendorRepository.findOne({ where: { id: vendorIdOrUserId } });
        if (!vendor) {
            vendor = await this.vendorRepository.findOne({ where: { userId: vendorIdOrUserId } });
        }
        if (!vendor) throw new NotFoundException('Vendor not found');

        return this.processSubscriptionSuccess(vendor.id, planId, mockSessionId, 'Mock');
    }

    /**
     * Get active subscription for vendor (supports both old and new system)
     * Checks both the old and new system and normalizes the response.
     */
    async getActiveSubscription(userId: string): Promise<any> {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) return null;

        let result: any = null;
        let isNewSystem = false;

        // 1. Try new PricingPlan system first (ActivePlan)
        const activeNewPlan = await this.activePlanRepository.findOne({
            where: { 
                vendorId: vendor.id, 
                status: ActivePlanStatus.ACTIVE,
                endDate: MoreThan(new Date())
            },
            relations: ['plan'],
            order: { endDate: 'DESC' }
        });

        if (activeNewPlan && activeNewPlan.plan?.type === PricingPlanType.SUBSCRIPTION) {
            result = activeNewPlan;
            isNewSystem = true;
        } else {
            // 2. Try old Subscription system
            let activeSub = await this.subscriptionRepository.findOne({
                where: { 
                    vendorId: vendor.id, 
                    status: SubscriptionStatus.ACTIVE,
                    endDate: MoreThan(new Date())
                },
                relations: ['plan'],
                order: { endDate: 'DESC' }
            });

            // --- FALLBACK: If no active subscription anywhere, try to assign Free Plan ---
            if (!activeSub && !activeNewPlan) {
                // Check for new Free Plan first
                const newFreePlan = await this.pricingPlanRepository.findOne({
                    where: { name: 'Free', type: PricingPlanType.SUBSCRIPTION }
                });

                if (newFreePlan) {
                    const now = new Date();
                    const endDate = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000);
                    const activePlan = this.activePlanRepository.create({
                        vendorId: vendor.id,
                        planId: newFreePlan.id,
                        status: ActivePlanStatus.ACTIVE,
                        startDate: now,
                        endDate: endDate,
                        amountPaid: 0,
                    });
                    const saved = await this.activePlanRepository.save(activePlan);
                    saved.plan = newFreePlan;
                    result = saved;
                    isNewSystem = true;
                } else {
                    // Fallback to old Free Plan if exists
                    const freePlan = await this.planRepository.findOne({ 
                        where: { id: '00000000-0000-0000-0000-000000000001' } 
                    });
                    if (freePlan) {
                        const now = new Date();
                        const endDate = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000);
                        const newSub = this.subscriptionRepository.create({
                            vendorId: vendor.id,
                            planId: freePlan.id,
                            status: SubscriptionStatus.ACTIVE,
                            startDate: now,
                            endDate: endDate,
                            amount: 0,
                            autoRenew: false,
                        });
                        const savedSub = await this.subscriptionRepository.save(newSub);
                        savedSub.plan = freePlan;
                        result = savedSub;
                        isNewSystem = false;
                    }
                }
            } else {
                // Determine which one to show. 
                // If there's an active Subscription-type new plan, it won't reach here.
                // If there's an active Offer plan and an active old Subscription, prioritize the Subscription.
                result = activeSub || activeNewPlan;
                isNewSystem = result === activeNewPlan;
            }
        }

        if (!result) return null;

        // Normalize the response object for the frontend
        return {
            ...result,
            // Ensure amount and endDate are consistently named
            amount: isNewSystem ? result.amountPaid : result.amount,
            endDate: result.endDate,
            isNewSystem,
            // Pass the plan object through, adding planType for frontend compatibility
            plan: result.plan ? {
                ...result.plan,
                planType: isNewSystem 
                    ? (result.plan.name?.toLowerCase() === 'free' ? 'free' : (result.plan.type === PricingPlanType.SUBSCRIPTION ? 'premium' : result.plan.type)) 
                    : result.plan.planType
            } : null
        };
    }

    /**
     * Get all available pricing plans of a specific type (Client)
     */
    async getPricingPlans(type?: PricingPlanType): Promise<PricingPlan[]> {
        const where: any = { isActive: true };
        if (type) where.type = type;
        return this.pricingPlanRepository.find({ where, order: { price: 'ASC' } });
    }

    /**
     * Create a Stripe Checkout session for a new PricingPlan (Subscription or Boost)
     */
    async createPricingCheckoutSession(userId: string, planId: string, targetId?: string) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user']
        });
        if (!vendor) throw new ForbiddenException('Only vendors can purchase plans');

        const plan = await this.pricingPlanRepository.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        // Free plan - instant activation
        if (plan.price <= 0) {
            await this.processActivePlanSuccess(vendor.id, plan.id, `FREE-${Date.now()}`, 'Mock', targetId);
            return { sessionId: 'FREE', checkoutUrl: null };
        }

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const baseUrl = frontendUrl.split(',')[0].trim();

        // Ensure Stripe Price exists
        if (!plan.stripePriceId) {
            const product = await this.stripe.products.create({ 
                name: plan.name,
                metadata: { type: plan.type }
            });
            const price = await this.stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(Number(plan.price) * 100),
                currency: 'pkr',
                recurring: plan.type === PricingPlanType.SUBSCRIPTION ? { 
                    interval: plan.unit === PricingPlanUnit.YEARS ? 'year' : 'month' 
                } : undefined,
            });
            plan.stripePriceId = price.id;
            await this.pricingPlanRepository.save(plan);
        }

        // ── Resolve Stripe Customer ID ─────────────────────────────────────
        let customerId = vendor.stripeCustomerId;

        if (customerId) {
            try {
                // Synchronize customer details with Stripe
                await this.stripe.customers.update(customerId, {
                    email: vendor.businessEmail || vendor.user?.email,
                    name: vendor.businessName || vendor.user?.fullName,
                    phone: vendor.businessPhone || vendor.user?.phone || undefined,
                    address: { country: 'PK' },
                });
                this.logger.log(`Synchronized Stripe customer ${customerId} for vendor ${vendor.id}`);
            } catch (err: any) {
                if (err?.code === 'resource_missing' || err?.message?.includes('No such customer')) {
                    this.logger.warn(`Stale Stripe customer ID "${customerId}" — clearing and recreating.`);
                    customerId = null;
                    vendor.stripeCustomerId = null;
                    await this.vendorRepository.save(vendor);
                } else {
                    this.logger.error(`Failed to update Stripe customer ${customerId}: ${err.message}`);
                }
            }
        }

        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: vendor.businessEmail || vendor.user?.email,
                name: vendor.businessName || vendor.user?.fullName,
                phone: vendor.businessPhone || vendor.user?.phone || undefined,
                address: { country: 'PK' },
                metadata: { vendorId: vendor.id },
            });
            customerId = customer.id;
            vendor.stripeCustomerId = customerId;
            await this.vendorRepository.save(vendor);
            this.logger.log(`Created new Stripe customer ${customerId} for vendor ${vendor.id}`);
        }

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            customer: customerId,
            client_reference_id: vendor.id,
            metadata: { 
                planId: plan.id,
                targetId: targetId || '',
                type: plan.type
            },
            line_items: [{ price: plan.stripePriceId, quantity: 1 }],
            mode: plan.type === PricingPlanType.SUBSCRIPTION ? 'subscription' : 'payment',
            success_url: `${baseUrl}/vendor/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${baseUrl}/vendor/subscription?canceled=true`,
        };

        const session = await this.stripe.checkout.sessions.create(sessionParams);

        return {
            sessionId: session.id,
            checkoutUrl: session.url,
        };
    }

    /**
     * Process successful purchase of a new PricingPlan
     */
    async processActivePlanSuccess(
        vendorId: string,
        planId: string,
        gatewayTransactionId: string,
        gateway: string,
        targetId?: string
    ) {
        const plan = await this.pricingPlanRepository.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const now = new Date();
        let startDate = now;

        // Check for existing ACTIVE plan of the same type to support "Extension/Stacking"
        // This handles the requirement: "if vendor purchase a plan plan will we active in next month"
        const existingActivePlan = await this.activePlanRepository.findOne({
            where: { 
                vendorId, 
                status: ActivePlanStatus.ACTIVE,
                targetId: targetId || IsNull()
            },
            relations: ['plan'],
            order: { endDate: 'DESC' }
        });

        // If an active plan exists of the SAME TYPE, extend it
        if (existingActivePlan && existingActivePlan.plan?.type === plan.type) {
            // Only extend if it's not already expired
            if (new Date(existingActivePlan.endDate) > now) {
                startDate = new Date(existingActivePlan.endDate);
                this.logger.log(`🔄 Extending existing plan. New StartDate: ${startDate}`);
            }
        }

        const endDate = new Date(startDate);

        // Calculate end date from the startDate (which might be in the future)
        switch (plan.unit) {
            case PricingPlanUnit.MINUTES: endDate.setMinutes(endDate.getMinutes() + plan.duration); break;
            case PricingPlanUnit.HOURS: endDate.setHours(endDate.getHours() + plan.duration); break;
            case PricingPlanUnit.DAYS: endDate.setDate(endDate.getDate() + plan.duration); break;
            case PricingPlanUnit.MONTHS: endDate.setMonth(endDate.getMonth() + plan.duration); break;
            case PricingPlanUnit.YEARS: endDate.setFullYear(endDate.getFullYear() + plan.duration); break;
        }

        // Only deactivate if it's a DIFFERENT plan category or the user explicitly chose an upgrade
        if (plan.type === PricingPlanType.SUBSCRIPTION && (!existingActivePlan || existingActivePlan.plan?.type !== plan.type)) {
            await this.activePlanRepository.update(
                { vendorId, status: ActivePlanStatus.ACTIVE, plan: { type: PricingPlanType.SUBSCRIPTION } as any },
                { status: ActivePlanStatus.CANCELLED }
            );
        }

        const activePlan = this.activePlanRepository.create({
            vendorId,
            planId,
            targetId,
            status: ActivePlanStatus.ACTIVE,
            startDate,
            endDate,
            amountPaid: plan.price,
            transactionId: gatewayTransactionId,
        });

        const saved = await this.activePlanRepository.save(activePlan);

        // Sync flags if needed (featured/boosted)
        if (targetId) {
            if (plan.type === PricingPlanType.HOMEPAGE_FEATURED || plan.type === PricingPlanType.CATEGORY_FEATURED) {
                await this.listingRepo.update(targetId, { isFeatured: true });
            } else if (plan.type === PricingPlanType.LISTING_BOOST) {
                await this.listingRepo.update(targetId, { isSponsored: true });
            }
        }

        // Record transaction
        const transaction = this.transactionRepository.create({
            vendorId,
            amount: plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId,
            paymentGateway: gateway,
            invoiceNumber: `INV-${plan.type.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        });
        await this.transactionRepository.save(transaction);

        return saved;
    }

    /**
     * Check if a vendor can perform an action based on their current plan limits
     */
    async canPerformAction(userId: string, feature: string): Promise<boolean> {
        const activeSub = await this.getActiveSubscription(userId);
        if (!activeSub) return false;

        const features = (activeSub as any).plan?.features || (activeSub as any).plan?.dashboardFeatures || {};
        const limit = features[feature];

        if (limit === true) return true;
        if (typeof limit === 'number') {
            const vendor = await this.vendorRepository.findOne({ where: { userId } });
            if (!vendor) return false;

            // Check specific limits
            if (feature === 'maxListings') {
                const count = await this.listingRepo.count({ where: { vendorId: vendor.id } });
                return count < limit;
            }
            // Add other limit checks (maxOffers, etc.) as needed
        }

        return false;
    }

    /**
     * Get transaction history for vendor (invoices)
     */
    async getTransactions(userId: string) {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException('Vendor not found');

        return this.transactionRepository.find({
            where: { vendorId: vendor.id },
            relations: ['subscription', 'subscription.plan'],
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Get single invoice/transaction detail for vendor
     */
    async getInvoiceDetail(transactionId: string, userId: string) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!vendor) throw new ForbiddenException('Vendor not found');

        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId, vendorId: vendor.id },
            relations: ['subscription', 'subscription.plan'],
        });
        if (!transaction) throw new NotFoundException('Invoice not found');

        return {
            transaction,
            vendor: {
                businessName: vendor.businessName,
                businessEmail: vendor.businessEmail,
                businessPhone: vendor.businessPhone,
                ntnNumber: vendor.ntnNumber,
                gstNumber: vendor.gstNumber,
            },
            user: {
                fullName: vendor.user?.fullName,
                email: vendor.user?.email,
                phone: vendor.user?.phone,
            },
        };
    }

    /**
     * Vendor: Change (Upgrade/Downgrade) Subscription Plan
     */
    async changeSubscription(userId: string, planId: string) {
        // For a production-ready flow, we simply initiate a new checkout session.
        // The webhook will handle cancelling the previous one upon successful payment.
        return this.createCheckoutSession(userId, { planId });
    }

    /**
     * Handle Stripe Webhooks
     */
    async handleStripeWebhook(signature: string, payload: Buffer) {
        let event: Stripe.Event;
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

        if (!webhookSecret || webhookSecret === 'whsec_your_webhook_secret_here') {
            this.logger.error('❌ STRIPE_WEBHOOK_SECRET is not configured or is using placeholder. Webhook verification will fail.');
        }

        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret || ''
            );
            this.logger.log(`✅ Webhook verified successfully. Event type: ${event.type}`);
        } catch (err: any) {
            this.logger.error(`❌ Webhook signature verification failed: ${err.message}`);
            // In development, you might want to log the payload or signature for debugging
            // but NEVER in production for security reasons.
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        this.logger.log(`📦 Processing Stripe event: ${event.id} [${event.type}]`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                this.logger.log(`💳 Checkout session completed: ${session.id} for customer: ${session.customer}`);

                // --- OFFER / EVENT PLAN (OfferEventPricing) ---
                if (session.metadata?.offerPlanId) {
                    const vendorId = session.client_reference_id;
                    const { offerPlanId } = session.metadata;
                    this.logger.log(`🎯 Activating offer/event plan: ${offerPlanId} for vendor: ${vendorId}`);
                    // vendorId here is the vendor.id (client_reference_id)
                    const plan = await this.offerPricingRepository.findOne({ where: { id: offerPlanId } });
                    if (plan) {
                        const transactionId = `OEP-STRIPE-${session.id.slice(-8)}`;
                        const transaction = this.transactionRepository.create({
                            vendorId,
                            amount: plan.price,
                            status: PaymentStatus.COMPLETED,
                            paidAt: new Date(),
                            gatewayTransactionId: session.id,
                            paymentGateway: 'Stripe',
                            invoiceNumber: `INV-OEP-${Date.now().toString().slice(-6)}`,
                        });
                        await this.transactionRepository.save(transaction);
                        this.logger.log(`✅ Offer plan "${plan.name}" activated via Stripe for vendor ${vendorId}`);
                    }
                    return { received: true };
                }

                // --- NEW SYSTEM (ActivePlan / PricingPlan) ---
                if (session.metadata?.planId) {
                    const vendorId = session.client_reference_id;
                    const { planId, targetId } = session.metadata;
                    this.logger.log(`🚀 Activating new-style plan: ${planId} for vendor: ${vendorId}`);
                    await this.processActivePlanSuccess(vendorId, planId, session.id, 'Stripe', targetId);
                    return { received: true };
                }

                // --- OLD SYSTEM (FALLBACK) ---
                if (session.mode === 'subscription') {
                    const vendorId = session.client_reference_id;
                    if (session.subscription && vendorId) {
                        const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
                        const priceId = subscription.items.data[0].price.id;
                        
                        const plan = await this.planRepository.findOne({ where: { stripePriceId: priceId } });
                        if (plan) {
                            await this.processSubscriptionSuccess(vendorId, plan.id, session.id, 'Stripe');
                        }
                    }
                }
                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as any; // Cast to any to avoid property access errors
                this.logger.log(`💰 Invoice paid: ${invoice.id} for customer: ${invoice.customer}`);

                // For recurring subscription payments
                if (invoice.subscription) {
                    const stripeSub = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
                    const vendor = await this.vendorRepository.findOne({ where: { stripeCustomerId: invoice.customer as string } });
                    
                    if (vendor) {
                        const priceId = stripeSub.items.data[0].price.id;
                        const plan = await this.planRepository.findOne({ where: { stripePriceId: priceId } });
                        const activeSub = await this.subscriptionRepository.findOne({
                            where: { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
                            order: { createdAt: 'DESC' }
                        });

                        if (activeSub && plan) {
                            this.logger.log(`🔄 Extending subscription for vendor: ${vendor.id}`);
                            
                            // Extend end date based on plan's billing cycle (perfect calendar date)
                            const currentEnd = new Date(activeSub.endDate);
                            const referenceDate = new Date(Math.max(currentEnd.getTime(), Date.now()));
                            const newEnd = new Date(referenceDate);

                            if (plan.billingCycle?.toLowerCase() === 'yearly') {
                                newEnd.setFullYear(newEnd.getFullYear() + 1);
                            } else {
                                newEnd.setMonth(newEnd.getMonth() + 1);
                            }
                            
                            activeSub.endDate = newEnd;
                            await this.subscriptionRepository.save(activeSub);

                            // Create a new transaction for the renewal
                            const invoiceNumber = `INV-STRIPE-RENEW-${Date.now().toString().slice(-6)}`;
                            const transaction = this.transactionRepository.create({
                                subscriptionId: activeSub.id,
                                vendorId: vendor.id,
                                amount: invoice.amount_paid / 100, // Stripe returns cents
                                status: PaymentStatus.COMPLETED,
                                paidAt: new Date(),
                                gatewayTransactionId: invoice.id,
                                paymentGateway: 'Stripe',
                                invoiceNumber,
                            });
                            await this.transactionRepository.save(transaction);
                            this.logger.log(`✅ Subscription extended and renewal invoice created for vendor: ${vendor.id}`);
                        }
                    }
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                this.logger.log(`🚫 Subscription deleted: ${subscription.id} for customer: ${subscription.customer}`);
                
                const vendor = await this.vendorRepository.findOne({ where: { stripeCustomerId: subscription.customer as string } });
                if (vendor) {
                    this.logger.log(`📉 Cancelling active subscription for vendor: ${vendor.id}`);
                    await this.subscriptionRepository.update(
                        { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
                        { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() }
                    );
                    this.logger.log(`✅ Subscription cancelled for vendor: ${vendor.id}`);
                } else {
                    this.logger.warn(`⚠️ Vendor not found for Stripe Customer ID: ${subscription.customer}`);
                }
                break;
            }
            default:
                this.logger.log(`ℹ️ Unhandled event type: ${event.type}`);
        }
        return { received: true };
    }

    // ─── Offer & Event Pricing Plans ────────────────────────────────────────────

    /**
     * PUBLIC: Get all active offer/event pricing plans
     */
    async getOfferPlans(type?: 'offer' | 'event'): Promise<OfferEventPricing[]> {
        const where: any = { isActive: true };
        if (type) where.type = type;
        return this.offerPricingRepository.find({ where, order: { price: 'ASC' } });
    }

    /**
     * ADMIN: Get all offer/event pricing plans (including inactive)
     */
    async getOfferPlansAdmin(type?: 'offer' | 'event'): Promise<OfferEventPricing[]> {
        const where: any = {};
        if (type) where.type = type;
        return this.offerPricingRepository.find({ where, order: { type: 'ASC', price: 'ASC' } });
    }

    /**
     * ADMIN: Create a new offer/event pricing plan
     */
    async createOfferPlan(dto: CreateOfferPlanDto): Promise<OfferEventPricing> {
        const plan = this.offerPricingRepository.create({
            name: dto.name,
            type: dto.type,
            price: dto.price,
            unit: dto.unit as any,
            duration: dto.duration,
            isActive: dto.isActive ?? true,
        });
        return this.offerPricingRepository.save(plan);
    }

    /**
     * ADMIN: Update an offer/event pricing plan
     */
    async updateOfferPlan(id: string, dto: UpdateOfferPlanDto): Promise<OfferEventPricing> {
        const plan = await this.offerPricingRepository.findOne({ where: { id } });
        if (!plan) throw new NotFoundException('Offer plan not found');
        Object.assign(plan, dto);
        return this.offerPricingRepository.save(plan);
    }

    /**
     * ADMIN: Delete an offer/event pricing plan
     */
    async deleteOfferPlan(id: string): Promise<void> {
        const plan = await this.offerPricingRepository.findOne({ where: { id } });
        if (!plan) throw new NotFoundException('Offer plan not found');
        await this.offerPricingRepository.remove(plan);
    }

    /**
     * VENDOR: Create a Stripe Checkout session for an Offer/Event pricing plan.
     *
     * Uses recurring/subscription mode (not one-time payment) because Stripe's
     * $0.50 USD minimum only applies to one-time payments. Subscription mode
     * accepts any PKR amount, mirroring how vendor subscription billing plans work.
     *
     * The Stripe Price ID is cached on the plan row (stripe_price_id) so we don't
     * create a new price on every checkout — identical to how PricingPlan works.
     */
    async createOfferPlanCheckoutSession(
        userId: string,
        offerPlanId: string,
    ): Promise<{ sessionId: string; checkoutUrl: string }> {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!vendor) throw new ForbiddenException('Only vendors can purchase offer plans');

        const plan = await this.offerPricingRepository.findOne({ where: { id: offerPlanId, isActive: true } });
        if (!plan) throw new NotFoundException('Offer plan not found');

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const baseUrl = frontendUrl.split(',')[0].trim();

        // ── Ensure plan has a valid, price-matching Stripe Price (PKR recurring) ──
        // Mirrors the self-healing price logic in createPricingCheckoutSession.
        let needsNewPrice = !plan.stripePriceId;
        if (plan.stripePriceId) {
            try {
                const existing = await this.stripe.prices.retrieve(plan.stripePriceId);
                const expected = Math.round(Number(plan.price) * 100);
                if (existing.unit_amount !== expected || !existing.active) {
                    this.logger.warn(`Offer plan Stripe price mismatch — regenerating (${existing.unit_amount} vs ${expected})`);
                    needsNewPrice = true;
                }
            } catch {
                this.logger.warn(`Offer plan Stripe price ${plan.stripePriceId} not found — regenerating`);
                needsNewPrice = true;
            }
        }
        if (needsNewPrice) {
            const product = await this.stripe.products.create({
                name: plan.name,
                metadata: { offerPlanId: plan.id, type: plan.type },
            });
            // Use recurring so there is no $0.50 minimum (same as subscription plans)
            const price = await this.stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(Number(plan.price) * 100),
                currency: 'pkr',
                recurring: { interval: 'month' }, // recurring avoids one-time minimum
            });
            plan.stripePriceId = price.id;
            await this.offerPricingRepository.save(plan);
            this.logger.log(`Created Stripe price ${price.id} for offer plan "${plan.name}" at PKR ${plan.price}`);
        }

        // ── Resolve Stripe Customer ID (self-healing) ─────────────────────────
        let customerId = vendor.stripeCustomerId;
        if (customerId) {
            try {
                // Synchronize customer details with Stripe
                await this.stripe.customers.update(customerId, {
                    email: vendor.businessEmail || vendor.user?.email,
                    name: vendor.businessName || vendor.user?.fullName,
                    phone: vendor.businessPhone || vendor.user?.phone || undefined,
                    address: { country: 'PK' },
                });
                this.logger.log(`Synchronized Stripe customer ${customerId} for vendor ${vendor.id}`);
            } catch (err: any) {
                if (err?.code === 'resource_missing' || err?.message?.includes('No such customer')) {
                    this.logger.warn(`Stale Stripe customer ID "${customerId}" — clearing and recreating.`);
                    customerId = null;
                    vendor.stripeCustomerId = null;
                    await this.vendorRepository.save(vendor);
                } else {
                    this.logger.error(`Failed to update Stripe customer ${customerId}: ${err.message}`);
                }
            }
        }
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: vendor.businessEmail || vendor.user?.email,
                name: vendor.businessName || vendor.user?.fullName,
                metadata: { vendorId: vendor.id },
                address: { country: 'PK' },
            });
            customerId = customer.id;
            vendor.stripeCustomerId = customerId;
            await this.vendorRepository.save(vendor);
            this.logger.log(`Created Stripe customer ${customerId} for vendor ${vendor.id}`);
        }

        // ── Create checkout session (subscription mode = no $0.50 minimum) ────
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            client_reference_id: vendor.id,
            metadata: {
                offerPlanId: plan.id,
                planType: plan.type,
                planName: plan.name,
            },
            line_items: [{ price: plan.stripePriceId, quantity: 1 }],
            mode: 'subscription',
            locale: 'en',
            subscription_data: {
                // Cancel after first period so it acts as a one-time charge
                // Webhook will activate the plan on invoice.payment_succeeded
                metadata: {
                    offerPlanId: plan.id,
                    vendorId: vendor.id,
                },
            },
            success_url: `${baseUrl}/vendor/offer-plans/success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan.name)}&duration=${plan.duration}&unit=${plan.unit}`,
            cancel_url: `${baseUrl}/vendor/offer-plans?canceled=true`,
        });

        this.logger.log(`🛒 Offer plan checkout session ${session.id} created for vendor ${vendor.id}`);
        return { sessionId: session.id, checkoutUrl: session.url };
    }

    /**
     * VENDOR: Activate an offer/event pricing plan purchase (used by webhook after Stripe payment)
     * Uses offerPricingRepository — NOT pricingPlanRepository
     */
    async activateOfferPlan(
        userId: string,
        offerPlanId: string,
        gateway: string = 'Stripe',
    ): Promise<{ success: boolean; plan: OfferEventPricing; transactionId: string }> {
        const plan = await this.offerPricingRepository.findOne({ where: { id: offerPlanId, isActive: true } });
        if (!plan) throw new NotFoundException('Offer plan not found');

        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) throw new NotFoundException('Vendor profile not found');

        const transactionId = `OEP-${gateway.toUpperCase()}-${Date.now()}`;
        const now = new Date();

        // Record transaction
        const transaction = this.transactionRepository.create({
            vendorId: vendor.id,
            amount: plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId: transactionId,
            paymentGateway: gateway,
            invoiceNumber: `INV-OEP-${Date.now().toString().slice(-6)}`,
        });
        await this.transactionRepository.save(transaction);

        this.logger.log(`✅ Offer plan "${plan.name}" activated for vendor ${vendor.id}`);
        return { success: true, plan, transactionId };
    }
}



