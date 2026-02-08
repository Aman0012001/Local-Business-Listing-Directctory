import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { Business } from '../../entities/business.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Vendor, User, Business]),
    ],
    controllers: [VendorsController],
    providers: [VendorsService],
    exports: [VendorsService],
})
export class VendorsModule { }
