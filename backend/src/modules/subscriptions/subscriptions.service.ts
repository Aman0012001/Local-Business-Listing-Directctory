import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Transaction, PaymentStatus } from '../../entities/transaction.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { AffiliateReferral, ReferralStatus, ReferralType } from '../../entities/referral.entity';
import { Affiliate } from '../../entities/affiliate.entity';
import { CreatePlanDto, UpdatePlanDto, CheckoutDto, AssignPlanDto } from './dto/subscription.dto';

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
                // If customer exists, let's update their address and phone to PK to ensure the UI is correct
                await this.stripe.customers.update(customerId, {
                    address: { country: 'PK' },
                    phone: vendor.businessPhone || vendor.user?.phone || undefined,
                    name: vendor.businessName || vendor.user?.fullName,
                });
                this.logger.log(`Synchronized Stripe customer ${customerId} for vendor ${vendor.id} to PK region`);
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
     * Get active subscription for vendor
     */
    async getActiveSubscription(userId: string): Promise<Subscription | null> {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) return null; // Not using wrap ForbiddenException here to prevent dashboard crashes during hydration

        // Find the active subscription
        let activeSub = await this.subscriptionRepository.findOne({
            where: { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
            relations: ['plan'],
            order: { createdAt: 'DESC' }
        });

        // --- FALLBACK: If no active subscription, try to assign Free Plan ---
        if (!activeSub) {
            const freePlan = await this.planRepository.findOne({ 
                where: { id: '00000000-0000-0000-0000-000000000001' } 
            });
            if (freePlan) {
                // We'll create a simple active record for the free plan
                // so the vendor always has something active.
                this.logger.log(`Assigning automatic Free Plan fallback for vendor ${vendor.id}`);
                const now = new Date();
                const endDate = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000); // 10 years for free plan
                
                const newSub = this.subscriptionRepository.create({
                    vendorId: vendor.id,
                    planId: freePlan.id,
                    status: SubscriptionStatus.ACTIVE,
                    startDate: now,
                    endDate: endDate,
                    amount: 0,
                    autoRenew: false,
                });
                
                activeSub = await this.subscriptionRepository.save(newSub);
                activeSub.plan = freePlan; // Ensure plan relation is attached
            }
        }

        return activeSub;
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
                
                if (session.mode === 'subscription') {
                    const vendorId = session.client_reference_id;
                    this.logger.log(`🔍 client_reference_id (vendorId): ${vendorId}`);
                    
                    if (session.subscription && vendorId) {
                        const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
                        const priceId = subscription.items.data[0].price.id;
                        this.logger.log(`📄 Retraining price ID: ${priceId}`);
                        
                        const plan = await this.planRepository.findOne({ where: { stripePriceId: priceId } });
                        if (plan) {
                            this.logger.log(`🚀 Activating plan: ${plan.name} (${plan.id}) for vendor: ${vendorId}`);
                            await this.processSubscriptionSuccess(vendorId, plan.id, session.id, 'Stripe');
                            this.logger.log(`✅ Plan activated successfully for vendor: ${vendorId}`);
                        } else {
                            this.logger.error(`❌ Plan not found for Stripe Price ID: ${priceId}. Please ensure your DB is synced with Stripe.`);
                        }
                    } else {
                        this.logger.warn(`⚠️ Missing subscription ID (${session.subscription}) or vendorId (${vendorId}) in session.`);
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
}


