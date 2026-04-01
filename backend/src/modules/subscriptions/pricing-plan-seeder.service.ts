import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PricingPlan, PricingPlanType, PricingPlanUnit } from '../../entities/pricing-plan.entity';

@Injectable()
export class PricingPlanSeederService implements OnModuleInit {
    private readonly logger = new Logger(PricingPlanSeederService.name);

    constructor(
        @InjectRepository(PricingPlan)
        private pricingPlanRepo: Repository<PricingPlan>,
    ) {}

    async onModuleInit() {
        if (process.env.SEED_DATABASE === 'true') {
            await this.seed();
        }
    }

    async seed() {
        this.logger.log('🌱 Seeding pricing plans...');

        const plans = [
            // Subscriptions
            {
                name: 'Free',
                type: PricingPlanType.SUBSCRIPTION,
                price: 0,
                duration: 365,
                unit: PricingPlanUnit.DAYS,
                features: { maxListings: 1, maxOffers: 0, maxEvents: 0, showAnalytics: false },
                isActive: true,
            },
            {
                name: 'Premium',
                type: PricingPlanType.SUBSCRIPTION,
                price: 4500,
                duration: 1,
                unit: PricingPlanUnit.MONTHS,
                features: { maxListings: 20, maxOffers: 10, maxEvents: 5, showAnalytics: true, prioritySupport: true },
                isActive: true,
            },
            // One-off Boosts
            {
                name: 'Homepage Featured (24 Hours)',
                type: PricingPlanType.HOMEPAGE_FEATURED,
                price: 300,
                duration: 24,
                unit: PricingPlanUnit.HOURS,
                features: { homepage_visibility: true },
                isActive: true,
            },
            {
                name: 'Homepage Featured (7 Days)',
                type: PricingPlanType.HOMEPAGE_FEATURED,
                price: 1500,
                duration: 7,
                unit: PricingPlanUnit.DAYS,
                features: { homepage_visibility: true },
                isActive: true,
            },
            {
                name: 'Category Top Spot (24 Hours)',
                type: PricingPlanType.CATEGORY_FEATURED,
                price: 200,
                duration: 24,
                unit: PricingPlanUnit.HOURS,
                features: { category_visibility: true },
                isActive: true,
            },
            {
                name: 'Listing Boost (1 Hour)',
                type: PricingPlanType.LISTING_BOOST,
                price: 50,
                duration: 1,
                unit: PricingPlanUnit.HOURS,
                features: { top_ranking: true },
                isActive: true,
            },
        ];

        for (const planData of plans) {
            const existing = await this.pricingPlanRepo.findOne({
                where: { name: planData.name, type: planData.type }
            });

            if (!existing) {
                const plan = this.pricingPlanRepo.create(planData);
                await this.pricingPlanRepo.save(plan);
                this.logger.log(`✅ Created plan: ${planData.name}`);
            }
        }

        this.logger.log('✅ Pricing plan seeding complete.');
    }
}
