import { Repository } from 'typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Vendor } from '../../entities/vendor.entity';
import { CreatePlanDto, CheckoutDto } from './dto/subscription.dto';
import { ConfigService } from '@nestjs/config';
export declare class SubscriptionsService {
    private subscriptionRepository;
    private planRepository;
    private transactionRepository;
    private vendorRepository;
    private configService;
    constructor(subscriptionRepository: Repository<Subscription>, planRepository: Repository<SubscriptionPlan>, transactionRepository: Repository<Transaction>, vendorRepository: Repository<Vendor>, configService: ConfigService);
    getPlans(): Promise<SubscriptionPlan[]>;
    createPlan(createPlanDto: CreatePlanDto): Promise<SubscriptionPlan>;
    createCheckoutSession(userId: string, checkoutDto: CheckoutDto): Promise<{
        sessionId: string;
        checkoutUrl: string;
    }>;
    handleMockSubscriptionSuccess(vendorId: string, planId: string, mockSessionId: string): Promise<Subscription>;
    getActiveSubscription(userId: string): Promise<Subscription | null>;
    getTransactions(userId: string): Promise<Transaction[]>;
}
