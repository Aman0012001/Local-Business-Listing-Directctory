import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSetupService } from './business-setup.service';
import { BusinessSetupController } from './business-setup.controller';
import { BusinessQuestion } from '../../entities/business-question.entity';
import { VendorAttribute } from '../../entities/vendor-attribute.entity';
import { Vendor } from '../../entities/vendor.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([BusinessQuestion, VendorAttribute, Vendor]),
    ],
    controllers: [BusinessSetupController],
    providers: [BusinessSetupService],
    exports: [BusinessSetupService],
})
export class BusinessSetupModule { }
