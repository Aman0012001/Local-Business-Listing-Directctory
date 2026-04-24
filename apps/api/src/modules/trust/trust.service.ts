import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, MoreThan } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Review } from '../../entities/review.entity';

@Injectable()
export class TrustService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>,
    ) { }

    async calculateUserTrustScore(userId: string): Promise<number> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) return 0;

        let score = 10; // Base score for new members

        // 1. Account Age Factor
        const now = new Date();
        const accountAgeInDays = Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        score += Math.min(accountAgeInDays * 0.1, 20); // Max 20 points for age (after ~200 days)

        // 2. Review Count Factor
        const reviewCount = await this.reviewsRepository.count({ where: { userId } });
        score += Math.min(reviewCount * 2, 20); // Max 20 points for count

        // 3. Helpful Votes Factor
        score += Math.min((user.helpfulVotes || 0) * 5, 30); // Max 30 points for helpfulness

        // 4. Penalties - Spam Flags
        score -= ((user.spamFlags || 0) * 15); // Heavy penalty for spam

        // 5. Penalties - High Frequency Reviews (Anomaly Detection)
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const dailyReviews = await this.reviewsRepository.count({
            where: {
                userId,
                createdAt: Between(last24Hours, now)
            }
        });
        if (dailyReviews > 3) {
            score -= (dailyReviews - 3) * 10; // Penalty for suspicious activity
        }

        // Clamp score between 0 and 100
        const finalScore = Math.max(0, Math.min(100, score));
        const badge = this.getUserBadge(finalScore, reviewCount);

        await this.usersRepository.update(userId, { 
            trustScore: finalScore, 
            reviewCount,
            badge
        });

        return finalScore;
    }

    getUserBadge(score: number, reviewCount: number): string {
        if (score > 80 && reviewCount > 10) return 'Trusted Reviewer';
        if (score > 40) return 'Active Member';
        return 'New Member';
    }
}

@Injectable()
export class FraudDetectionService {
    constructor(
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>,
    ) { }

    async detectFraud(review: Partial<Review>): Promise<{ isFraud: boolean; reason?: string }> {
        // 1. IP Tracking
        if (review.ipAddress) {
            const sameIpReviews = await this.reviewsRepository.count({
                where: {
                    ipAddress: review.ipAddress,
                    businessId: review.businessId,
                    userId: Not(review.userId)
                }
            });
            if (sameIpReviews > 0) {
                return { isFraud: true, reason: 'Multiple reviews from same IP for this business' };
            }
        }

        // 2. Device Fingerprint
        if (review.deviceId) {
            const sameDeviceReviews = await this.reviewsRepository.count({
                where: {
                    deviceId: review.deviceId,
                    businessId: review.businessId,
                    userId: Not(review.userId)
                }
            });
            if (sameDeviceReviews > 0) {
                return { isFraud: true, reason: 'Multiple reviews from same device for this business' };
            }
        }

        // 3. Rating Spike Detection
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentReviewsCount = await this.reviewsRepository.count({
            where: {
                businessId: review.businessId,
                createdAt: MoreThan(oneHourAgo)
            }
        });
        if (recentReviewsCount > 10) {
            return { isFraud: true, reason: 'Rating spike detected' };
        }

        // 4. Duplicate Content Check (Simple)
        if (review.comment) {
            const duplicateContent = await this.reviewsRepository.count({
                where: {
                    comment: review.comment,
                    businessId: review.businessId,
                    userId: Not(review.userId)
                }
            });
            if (duplicateContent > 0) {
                return { isFraud: true, reason: 'Duplicate review content detected' };
            }
        }

        return { isFraud: false };
    }
}
