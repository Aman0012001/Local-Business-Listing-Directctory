import {
    Controller,
    Post,
    Headers,
    Req,
    RawBodyRequest,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../stripe/stripe.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionsService } from './subscriptions.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('webhooks/stripe')
export class StripeWebhooksController {
    private readonly logger = new Logger(StripeWebhooksController.name);

    constructor(
        private readonly stripeService: StripeService,
        private readonly configService: ConfigService,
        private readonly subService: SubscriptionsService,
    ) { }

    @Public()
    @Post()
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: RawBodyRequest<Request>,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        let event;

        try {
            event = await this.stripeService.constructEvent(
                request.rawBody,
                signature,
                webhookSecret,
            );
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        this.logger.log(`Received stripe event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            default:
                this.logger.warn(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }

    private async handleCheckoutSessionCompleted(session: any) {
        const vendorId = session.metadata?.vendorId;
        const planId = session.metadata?.planId;
        const stripeSubscriptionId = session.subscription;

        if (vendorId && planId && stripeSubscriptionId) {
            await this.subService.handleStripeSubscriptionSuccess(
                vendorId,
                planId,
                stripeSubscriptionId,
            );
        }
    }

    private async handleSubscriptionUpdated(subscription: any) {
        await this.subService.syncStripeSubscription(subscription.id);
    }

    private async handleSubscriptionDeleted(subscription: any) {
        await this.subService.cancelStripeSubscription(subscription.id);
    }
}
