import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferEvent } from '../../entities/offer-event.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { PromotionBooking } from '../../entities/promotion-booking.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([OfferEvent, Listing, Vendor, PromotionBooking]),
        ConfigModule,
        forwardRef(() => SubscriptionsModule),
    ],
    controllers: [OffersController],
    providers: [OffersService],
    exports: [OffersService],
})
export class OffersModule { }
