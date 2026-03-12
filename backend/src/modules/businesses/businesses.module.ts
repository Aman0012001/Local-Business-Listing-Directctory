import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { Listing } from '../../entities/business.entity';
import { BusinessHours } from '../../entities/business-hours.entity';
import { BusinessAmenity } from '../../entities/business-amenity.entity';
import { Amenity } from '../../entities/amenity.entity';
import { Category } from '../../entities/category.entity';
import { Vendor } from '../../entities/vendor.entity';
import { SearchModule } from '../search/search.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Listing,
            BusinessHours,
            BusinessAmenity,
            Amenity,
            Category,
            Vendor,
        ]),
        SearchModule,
    ],
    controllers: [BusinessesController],
    providers: [BusinessesService],
    exports: [BusinessesService],
})
export class BusinessesModule { }
