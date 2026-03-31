import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { OfferEvent } from '../../entities/offer-event.entity';
import { OfferEventPricing } from '../../entities/offer-event-pricing.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { PromotionBooking } from '../../entities/promotion-booking.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([OfferEvent, OfferEventPricing, Listing, Vendor, PromotionBooking]),
        ConfigModule,
    ],
    controllers: [OffersController],
    providers: [OffersService],
    exports: [OffersService],
})
export class OffersModule { }
