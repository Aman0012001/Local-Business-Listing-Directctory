import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../../entities/review.entity';
import { ReviewHelpfulVote } from '../../entities/review-helpful-vote.entity';
import { Listing } from '../../entities/business.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, ReviewHelpfulVote, Listing]),
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
