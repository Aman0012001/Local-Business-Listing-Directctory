import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubscriptionPlan, SubscriptionPlanType } from '../../entities/subscription-plan.entity';

@Injectable()
export class SubscriptionsSeederService implements OnModuleInit {
    private readonly logger = new Logger(SubscriptionsSeederService.name);

    constructor(
        @InjectRepository(SubscriptionPlan)
        private planRepository: Repository<SubscriptionPlan>,
        private configService: ConfigService,
    ) { }

    async onModuleInit() {
        const val = this.configService.get('SEED_DATABASE');
        const shouldSeed = String(val) === 'true';
        if (shouldSeed) {
            await this.seedPlans();
        }
    }

    async seedPlans() {
        this.logger.log('🌱 Starting subscription plans seeding...');

        const plans = [
            {
                id: '00000000-0000-0000-0000-000000000001',
                name: 'Free',
                planType: SubscriptionPlanType.FREE,
                description: 'Get your business online with a basic profile. No credit card required.',
                price: 0,
                billingCycle: 'monthly',
                maxListings: 1,
                dashboardFeatures: {
                    showListings: true,       // can see their 1 listing
                    canAddListing: true,       // can add 1 listing (enforced by maxListings)
                    showSaved: false,
                    showFollowing: false,
                    showQueries: false,
                    showLeads: false,
                    showOffers: false,
                    showReviews: false,
                    showAnalytics: false,
                    showChat: false,
                    showBroadcast: false,
                    maxKeywords: 0,
                },
                isFeatured: false,
                stripePriceId: null,
                isActive: true,
            },
            {
                id: '00000000-0000-0000-0000-000000000003',
                name: 'Basic',
                planType: SubscriptionPlanType.BASIC,
                description: 'Full access to every feature. Grow your local presence with unlimited listings, analytics, and direct customer engagement.',
                price: 2000,
                billingCycle: 'monthly',
                maxListings: 999,
                dashboardFeatures: {
                    showListings: true,
                    canAddListing: true,
                    showSaved: true,
                    showFollowing: true,
                    showQueries: true,
                    showLeads: true,
                    showOffers: true,
                    showReviews: true,
                    showAnalytics: true,
                    showChat: true,
                    showBroadcast: true,
                    maxKeywords: 10,
                },
                isFeatured: true,
                stripePriceId: 'price_1TFl84B8g7hLDd8UNvtGDhrg', // PKR 2,000/month – Basic Vendor Plan (Stripe)
                isActive: true,
            },
        ];

        // Seeding / Updating
        for (const planData of plans) {
            const existing = await this.planRepository.findOne({
                where: { id: planData.id }
            });

            if (existing) {
                this.logger.log(`Updating plan: ${planData.name}`);
                await this.planRepository.update(existing.id, planData as any);
            } else {
                this.logger.log(`Creating new plan: ${planData.name}`);
                const plan = this.planRepository.create(planData as any);
                await this.planRepository.save(plan);
            }
        }

        // Deactivate others
        const activeIds = plans.map(p => p.id);
        await this.planRepository.update(
            { id: Not(In(activeIds)) },
            { isActive: false }
        );

        this.logger.log('✅ Subscription plans seeding completed.');
    }
}
