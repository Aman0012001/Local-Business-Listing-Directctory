import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Vendor } from '../../entities/vendor.entity';

import { StripeModule } from '../stripe/stripe.module';

import { StripeWebhooksController } from './stripe-webhooks.controller';
import { SubscriptionsSeederService } from './subscriptions-seeder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Subscription,
            SubscriptionPlan,
            Transaction,
            Vendor,
        ]),
        StripeModule,
    ],
    controllers: [SubscriptionsController, StripeWebhooksController],
    providers: [SubscriptionsService, SubscriptionsSeederService],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule { }
