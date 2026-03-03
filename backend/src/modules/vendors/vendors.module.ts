import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { Listing } from '../../entities/business.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vendor, User, Listing]),
        BusinessesModule,
    ],
    controllers: [VendorsController],
    providers: [VendorsService],
    exports: [VendorsService],
})
export class VendorsModule { }
