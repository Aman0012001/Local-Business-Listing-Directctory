import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

@Module({
    imports: [TypeOrmModule], // ✅ THIS FIXES EVERYTHING
    controllers: [HealthController],
})
export class HealthModule { }