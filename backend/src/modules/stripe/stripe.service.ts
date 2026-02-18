import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor(private configService: ConfigService) {
        const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            this.logger.error('STRIPE_SECRET_KEY is not defined in environment variables');
            // --- .env.example configuration for Stripe ---
            // STRIPE_SECRET_KEY=sk_test_...
            // STRIPE_PUBLIC_KEY=pk_test_...
            // STRIPE_WEBHOOK_SECRET=whsec_...
            // -------------------------------------------
        }
        this.stripe = new Stripe(stripeSecretKey || '', {
            apiVersion: '2023-08-16', // Ensure this matches user's preferred or latest stable
        });
    }

    async createCustomer(email: string, name: string) {
        return this.stripe.customers.create({
            email,
            name,
        });
    }

    async createCheckoutSession(params: {
        customerId: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }) {
        return this.stripe.checkout.sessions.create({
            customer: params.customerId,
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
        });
    }

    async constructEvent(payload: string | Buffer, signature: string, secret: string) {
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }

    async getSubscription(subscriptionId: string) {
        return this.stripe.subscriptions.retrieve(subscriptionId);
    }

    async cancelSubscription(subscriptionId: string) {
        return this.stripe.subscriptions.cancel(subscriptionId);
    }
}
