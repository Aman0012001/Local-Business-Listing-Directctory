import { Vendor } from './vendor.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Transaction } from './transaction.entity';
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    SUSPENDED = "suspended"
}
export declare class Subscription {
    id: string;
    vendorId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    amount: number;
    currency: string;
    cancelledAt: Date;
    cancellationReason: string;
    createdAt: Date;
    updatedAt: Date;
    vendor: Vendor;
    plan: SubscriptionPlan;
    transactions: Transaction[];
}
