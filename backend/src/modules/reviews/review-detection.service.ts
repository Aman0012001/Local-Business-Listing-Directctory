import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Review } from '../../entities/review.entity';

@Injectable()
export class ReviewDetectionService {
    constructor(
        @InjectRepository(Review)
        private reviewRepository: Repository<Review>,
    ) {}

    /**
     * Analyze a review for suspicious activity
     */
    async analyzeReview(review: Review): Promise<{
        isSuspicious: boolean;
        score: number;
        reason: string | null;
    }> {
        let totalScore = 0;
        let reasons: string[] = [];

        // 1. Check for IP repetition
        if (review.ipAddress) {
            const ipCount = await this.reviewRepository.count({
                where: { ipAddress: review.ipAddress },
            });
            if (ipCount > 3) {
                totalScore += 0.4;
                reasons.push('Multiple reviews from same IP');
            }
        }

        // 2. Check for frequency (last 24h)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const userCount = await this.reviewRepository.count({
            where: { 
                userId: review.userId,
                createdAt: MoreThan(dayAgo)
            },
        });
        if (userCount > 5) {
            totalScore += 0.3;
            reasons.push('High frequency of reviews in 24h');
        }

        // 3. Check for repetitive text similarity (basic check)
        if (review.comment && review.comment.length > 20) {
            const similarReview = await this.reviewRepository.findOne({
                where: { 
                    userId: review.userId,
                    comment: review.comment 
                },
            });
            if (similarReview && similarReview.id !== review.id) {
                totalScore += 0.5;
                reasons.push('Identical text with previous review');
            }
        }

        // 4. Short review check
        if (review.comment && review.comment.length < 10) {
            totalScore += 0.1;
            reasons.push('Extremely short comment');
        }

        return {
            isSuspicious: totalScore >= 0.5,
            score: Math.min(totalScore, 1),
            reason: reasons.length > 0 ? reasons.join(', ') : null,
        };
    }
}
