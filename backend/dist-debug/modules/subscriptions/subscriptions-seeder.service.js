"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SubscriptionsSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const subscription_plan_entity_1 = require("../../entities/subscription-plan.entity");
let SubscriptionsSeederService = SubscriptionsSeederService_1 = class SubscriptionsSeederService {
    constructor(planRepository, configService) {
        this.planRepository = planRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(SubscriptionsSeederService_1.name);
    }
    async onModuleInit() {
        const shouldSeed = this.configService.get('SEED_DATABASE') === 'true';
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
                planType: subscription_plan_entity_1.SubscriptionPlanType.FREE,
                description: 'Essential tools for small local businesses starting out.',
                price: 0,
                billingCycle: 'monthly',
                features: ["1 Business Listing", "Basic Search Discovery", "Email Support", "5 Photo Gallery"],
                maxListings: 1,
                isFeatured: false,
                isActive: true,
            },
            {
                id: '00000000-0000-0000-0000-000000000002',
                name: 'Professional',
                planType: subscription_plan_entity_1.SubscriptionPlanType.BASIC,
                description: 'Everything you need to dominate your local market.',
                price: 49,
                billingCycle: 'monthly',
                features: ["10 Business Listings", "Priority Discovery", "Featured Badge", "Unlimited Photos", "WhatsApp Integration", "Lead Exports"],
                maxListings: 10,
                isFeatured: true,
                isActive: true,
            },
            {
                id: '00000000-0000-0000-0000-000000000003',
                name: 'Enterprise',
                planType: subscription_plan_entity_1.SubscriptionPlanType.PREMIUM,
                description: 'For multi-location brands and high-volume agencies.',
                price: 199,
                billingCycle: 'monthly',
                features: ["Unlimited Listings", "Global Featured Banner", "API Access", "Dedicated Manager", "Custom Analytics"],
                maxListings: 999,
                isFeatured: false,
                isActive: true,
            },
        ];
        for (const planData of plans) {
            const existing = await this.planRepository.findOne({
                where: { planType: planData.planType }
            });
            if (existing) {
                this.logger.log(`Updating plan: ${planData.name}`);
                await this.planRepository.update(existing.id, {
                    ...planData,
                });
            }
            else {
                this.logger.log(`Creating new plan: ${planData.name}`);
                const plan = this.planRepository.create(planData);
                await this.planRepository.save(plan);
            }
        }
        this.logger.log('✅ Subscription plans seeding completed.');
    }
};
exports.SubscriptionsSeederService = SubscriptionsSeederService;
exports.SubscriptionsSeederService = SubscriptionsSeederService = SubscriptionsSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], SubscriptionsSeederService);
//# sourceMappingURL=subscriptions-seeder.service.js.map