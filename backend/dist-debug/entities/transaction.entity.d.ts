import { Subscription } from './subscription.entity';
import { Vendor } from './vendor.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Transaction {
    id: string;
    subscriptionId: string;
    vendorId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    paymentGateway: string;
    gatewayTransactionId: string;
    status: PaymentStatus;
    invoiceNumber: string;
    invoiceUrl: string;
    metadata: Record<string, any>;
    paidAt: Date;
    failedAt: Date;
    refundedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    subscription: Subscription;
    vendor: Vendor;
}
