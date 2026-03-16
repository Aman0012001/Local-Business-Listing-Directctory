import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { Affiliate } from '../../entities/affiliate.entity';
import { AffiliateReferral } from '../../entities/referral.entity';
import { BusinessCheckIn } from '../../entities/check-in.entity';
import { Listing } from '../../entities/business.entity';
import { User } from '../../entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Affiliate,
            AffiliateReferral,
            BusinessCheckIn,
            Listing,
            User,
        ]),
    ],
    controllers: [AffiliateController],
    providers: [AffiliateService],
    exports: [AffiliateService],
})
export class AffiliateModule { }
