import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../../entities/review.entity';
import { Business } from '../../entities/business.entity';
import { User } from '../../entities/user.entity';
import { TrustModule } from '../trust/trust.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, Business, User]),
        TrustModule,
    ],
    providers: [ReviewsService],
    controllers: [ReviewsController],
})
export class ReviewsModule { }
