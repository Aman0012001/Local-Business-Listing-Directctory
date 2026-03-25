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
        const shouldSeed = this.configService.get<string>('SEED_DATABASE') === 'true';
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
                description: 'Essential tools for small local businesses starting out.',
                price: 0,
                billingCycle: 'monthly',
                features: ["1 Business Listing", "Basic Search Discovery", "Email Support", "5 Photo Gallery"],
                maxListings: 1,
                dashboardFeatures: {
                    showListings: true,
                    canAddListing: true,
                    showSaved: true,
                    showFollowing: true,
                    showQueries: true,
                    showLeads: false,
                    showOffers: false,
                    showReviews: true,
                    showAnalytics: false,
                    showChat: false,
                    showBroadcast: false,
                    maxKeywords: 0
                },
                isFeatured: false,
                isActive: true,
            },
            {
                id: '00000000-0000-0000-0000-000000000003',
                name: 'Premium',
                planType: SubscriptionPlanType.PREMIUM,
                description: 'Everything you need to dominate your local market.',
                price: 2000,
                billingCycle: 'monthly',
                features: ["Unlimited Listings", "Priority Discovery", "Featured Badge", "Unlimited Photos", "WhatsApp Integration", "Lead Exports"],
                maxListings: 999,
                dashboardFeatures: {
                    showListings: true,
                    canAddListing: true,
                    showLeads: true,
                    showOffers: true,
                    showReviews: true,
                    showAnalytics: true,
                    showSaved: true,
                    showFollowing: true,
                    showQueries: true,
                    showChat: true,
                    showBroadcast: true,
                    maxKeywords: 10
                },
                isFeatured: true,
                isActive: true,
            },
        ];

        // Seeding / Updating
        for (const planData of plans) {
            const existing = await this.planRepository.findOne({
                where: { planType: planData.planType }
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
        const activeTypes = plans.map(p => p.planType);
        await this.planRepository.update(
            { planType: Not(In(activeTypes)) },
            { isActive: false }
        );

        this.logger.log('✅ Subscription plans seeding completed.');
    }
}
