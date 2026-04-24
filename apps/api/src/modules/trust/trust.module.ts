import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustService, FraudDetectionService } from './trust.service';
import { User } from '../../entities/user.entity';
import { Review } from '../../entities/review.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Review])],
    providers: [TrustService, FraudDetectionService],
    exports: [TrustService, FraudDetectionService],
})
export class TrustModule { }
