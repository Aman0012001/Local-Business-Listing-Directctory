import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto, CheckoutDto } from './dto/subscription.dto';
import { User } from '../../entities/user.entity';
export declare class SubscriptionsController {
    private readonly subService;
    constructor(subService: SubscriptionsService);
    getPlans(): Promise<import("../../entities").SubscriptionPlan[]>;
    createPlan(createPlanDto: CreatePlanDto): Promise<import("../../entities").SubscriptionPlan>;
    createCheckout(user: User, checkoutDto: CheckoutDto): Promise<{
        sessionId: string;
        checkoutUrl: string;
    }>;
    getActive(user: User): Promise<import("../../entities").Subscription>;
    getTransactions(user: User): Promise<import("../../entities").Transaction[]>;
    mockSuccess(user: User, planId: string): Promise<import("../../entities").Subscription>;
}
