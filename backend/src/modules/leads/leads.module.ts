import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from '../../entities/lead.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lead, Listing, Vendor]),
    ],
    controllers: [LeadsController],
    providers: [LeadsService],
    exports: [LeadsService],
})
export class LeadsModule { }
