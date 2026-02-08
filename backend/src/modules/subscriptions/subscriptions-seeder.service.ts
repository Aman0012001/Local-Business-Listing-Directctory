import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
                name: 'Free Starter',
                planType: SubscriptionPlanType.FREE,
                description: 'Essential tools for small local businesses starting out.',
                price: 0,
                billingCycle: 'monthly',
                features: ["1 Business Listing", "Basic Search Discovery", "Email Support", "5 Photo Gallery"],
                maxListings: 1,
                isFeatured: false,
                isActive: true,
                stripePriceId: null,
            },
            {
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Professional',
                planType: SubscriptionPlanType.BASIC,
                description: 'Everything you need to dominate your local market.',
                price: 49,
                billingCycle: 'monthly',
                features: ["10 Business Listings", "Priority Discovery", "Featured Badge", "Unlimited Photos", "WhatsApp Integration", "Lead Exports"],
                maxListings: 10,
                isFeatured: true,
                isActive: true,
                stripePriceId: this.configService.get<string>('STRIPE_PRICE_BASIC'),
            },
            {
                id: '00000000-0000-0000-0000-000000000003',
                name: 'Enterprise',
                planType: SubscriptionPlanType.PREMIUM,
                description: 'For multi-location brands and high-volume agencies.',
                price: 199,
                billingCycle: 'monthly',
                features: ["Unlimited Listings", "Global Featured Banner", "API Access", "Dedicated Manager", "Custom Analytics"],
                maxListings: 999,
                isFeatured: false,
                isActive: true,
                stripePriceId: this.configService.get<string>('STRIPE_PRICE_PREMIUM'),
            },
        ];

        for (const planData of plans) {
            const existing = await this.planRepository.findOne({
                where: { planType: planData.planType }
            });

            if (existing) {
                // Update existing plan but keep stripePriceId if manually changed
                this.logger.log(`Updating plan: ${planData.name}`);
                await this.planRepository.update(existing.id, {
                    ...planData,
                    stripePriceId: existing.stripePriceId || planData.stripePriceId,
                });
            } else {
                this.logger.log(`Creating new plan: ${planData.name}`);
                const plan = this.planRepository.create(planData);
                await this.planRepository.save(plan);
            }
        }

        this.logger.log('✅ Subscription plans seeding completed.');
    }
}
