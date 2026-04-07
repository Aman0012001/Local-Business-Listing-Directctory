import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { Subscription } from '../../entities/subscription.entity';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { SubscriptionsSeederService } from './subscriptions-seeder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Subscription,
            SubscriptionPlan,
            Transaction,
            Vendor,
            User,
        ]),
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, SubscriptionsSeederService, SubscriptionCronService],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule { }
