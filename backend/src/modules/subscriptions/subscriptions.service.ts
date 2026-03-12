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
import { CreatePlanDto, UpdatePlanDto, CheckoutDto, AssignPlanDto } from './dto/subscription.dto';

import { ConfigService } from '@nestjs/config';

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
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private configService: ConfigService,
    ) { }

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
        const activeSubCount = await this.subscriptionRepository.count({
            where: { planId: id, status: SubscriptionStatus.ACTIVE }
        });

        if (activeSubCount > 0) {
            throw new BadRequestException('Cannot delete plan with active subscribers. Deactivate it instead.');
        }

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
            { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() }
        );

        const now = new Date();
        const durationDays = dto.durationDays || 30;
        const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

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

        sub.status = SubscriptionStatus.CANCELLED;
        sub.cancelledAt = new Date();
        sub.cancellationReason = 'Cancelled by admin';
        return this.subscriptionRepository.save(sub);
    }

    /**
     * Create a Mock checkout session since Stripe is removed
     */
    async createCheckoutSession(userId: string, checkoutDto: CheckoutDto) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user']
        });
        if (!vendor) throw new ForbiddenException('Only vendors can subscribe');

        const plan = await this.planRepository.findOne({ where: { id: checkoutDto.planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        return {
            sessionId: 'MOCK-SESSION-' + Date.now(),
            checkoutUrl: `${frontendUrl}/vendor/subscription/success?session_id=MOCK-SESSION-${Date.now()}&mock_plan_id=${plan.id}`,
        };
    }

    /**
     * Handle Mock Subscription Success
     * Accepts either a vendorId or a userId (will attempt to find vendor by userId as fallback)
     */
    async handleMockSubscriptionSuccess(vendorIdOrUserId: string, planId: string, mockSessionId: string) {
        const plan = await this.planRepository.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        // Try to find vendor directly, then by userId as fallback
        let vendor = await this.vendorRepository.findOne({ where: { id: vendorIdOrUserId } });
        if (!vendor) {
            vendor = await this.vendorRepository.findOne({ where: { userId: vendorIdOrUserId } });
        }
        if (!vendor) throw new NotFoundException('Vendor not found');

        // Cancel old subscription if exists
        await this.subscriptionRepository.update(
            { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() }
        );

        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const subscription = this.subscriptionRepository.create({
            vendorId: vendor.id,
            planId,
            status: SubscriptionStatus.ACTIVE,
            startDate: now,
            endDate: endDate,
            amount: plan.price,
            autoRenew: true,
        });

        const savedSub = await this.subscriptionRepository.save(subscription);

        // Record transaction
        const transaction = this.transactionRepository.create({
            subscriptionId: savedSub.id,
            vendorId: vendor.id,
            amount: plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId: mockSessionId,
            paymentGateway: 'Mock',
            invoiceNumber: `INV-${Date.now()}`,
        });

        await this.transactionRepository.save(transaction);

        return savedSub;
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
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
            relations: ['user']
        });
        if (!vendor) throw new ForbiddenException('Only vendors can change plans');

        const newPlan = await this.planRepository.findOne({ where: { id: planId } });
        if (!newPlan) throw new NotFoundException('New plan not found');

        // Check if there's an active subscription
        const activeSub = await this.subscriptionRepository.findOne({
            where: { vendorId: vendor.id, status: SubscriptionStatus.ACTIVE },
            relations: ['plan']
        });

        if (activeSub && activeSub.planId === planId) {
            throw new BadRequestException('You are already on this plan');
        }

        // In a real system, you'd calculate prorated amounts here.
        // For this mock implementation, we just cancel the old one and start new.
        if (activeSub) {
            activeSub.status = SubscriptionStatus.CANCELLED;
            activeSub.cancelledAt = new Date();
            activeSub.cancellationReason = `Switched to ${newPlan.name}`;
            await this.subscriptionRepository.save(activeSub);
        }

        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

        const subscription = this.subscriptionRepository.create({
            vendorId: vendor.id,
            planId: newPlan.id,
            status: SubscriptionStatus.ACTIVE,
            startDate: now,
            endDate,
            amount: newPlan.price,
            autoRenew: true,
        });

        const savedSub = await this.subscriptionRepository.save(subscription);

        // Record transaction
        const transaction = this.transactionRepository.create({
            subscriptionId: savedSub.id,
            vendorId: vendor.id,
            amount: newPlan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId: `PLAN-CHANGE-${Date.now()}`,
            paymentGateway: 'Mock',
            invoiceNumber: `INV-MOD-${Date.now()}`,
        });

        await this.transactionRepository.save(transaction);

        return {
            message: 'Plan changed successfully',
            subscription: savedSub
        };
    }
}

