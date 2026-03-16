import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesController } from './cities.controller';
import { CitiesAdminController } from './cities-admin.controller';
import { CitiesService } from './cities.service';
import { City } from '../../entities/city.entity';

@Module({
    imports: [TypeOrmModule.forFeature([City])],
    controllers: [CitiesController, CitiesAdminController],
    providers: [CitiesService],
    exports: [CitiesService],
})
export class CitiesModule { }
