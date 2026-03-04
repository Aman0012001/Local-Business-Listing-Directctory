import { Subscription } from './subscription.entity';
export declare enum SubscriptionPlanType {
    FREE = "free",
    BASIC = "basic",
    PREMIUM = "premium",
    ENTERPRISE = "enterprise"
}
export declare class SubscriptionPlan {
    id: string;
    name: string;
    planType: SubscriptionPlanType;
    description: string;
    price: number;
    billingCycle: string;
    features: string[];
    maxListings: number;
    isFeatured: boolean;
    isSponsored: boolean;
    analyticsEnabled: boolean;
    prioritySupport: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    subscriptions: Subscription[];
}
