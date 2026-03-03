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

        // Local Mode: Return mock success URL
        return {
            sessionId: 'MOCK-SESSION-' + Date.now(),
            checkoutUrl: `${frontendUrl}/vendor/subscription/success?session_id=MOCK-SESSION-${Date.now()}&mock_plan_id=${plan.id}`,
        };
    }


    /**
     * Handle Mock Subscription Success
     */
    async handleMockSubscriptionSuccess(vendorId: string, planId: string, mockSessionId: string) {
        const plan = await this.planRepository.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');

        const vendor = await this.vendorRepository.findOne({ where: { id: vendorId } });
        if (!vendor) throw new NotFoundException('Vendor not found');

        // Cancel old subscription if exists
        await this.subscriptionRepository.update(
            { vendorId, status: SubscriptionStatus.ACTIVE },
            { status: SubscriptionStatus.CANCELLED, cancelledAt: new Date() }
        );

        const now = new Date();
        const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const subscription = this.subscriptionRepository.create({
            vendorId,
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
            vendorId,
            amount: plan.price,
            status: PaymentStatus.COMPLETED,
            paidAt: now,
            gatewayTransactionId: mockSessionId,
            paymentGateway: 'Mock',
            invoiceNumber: `INV-MOCK-${Date.now()}`,
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
