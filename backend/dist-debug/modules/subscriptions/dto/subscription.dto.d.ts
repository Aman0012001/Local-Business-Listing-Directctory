import { SubscriptionPlanType } from '../../../entities/subscription-plan.entity';
export declare class CreatePlanDto {
    name: string;
    planType: SubscriptionPlanType;
    price: number;
    billingCycle: string;
    features: string[];
    maxListings: number;
    isFeatured?: boolean;
    isSponsored?: boolean;
}
export declare class CheckoutDto {
    planId: string;
    cycle: string;
}
