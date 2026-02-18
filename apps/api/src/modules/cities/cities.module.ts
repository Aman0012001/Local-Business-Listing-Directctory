import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesController } from './cities.controller';
import { Business } from '../../entities/business.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Business])],
    controllers: [CitiesController],
})
export class CitiesModule { }
