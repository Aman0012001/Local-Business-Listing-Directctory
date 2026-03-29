import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PricingPlan, PricingPlanType, PricingPlanUnit } from '../../entities/pricing-plan.entity';
import { ActivePlan, ActivePlanStatus } from '../../entities/active-plan.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';

@Injectable()
export class PromotionsService {
    private readonly logger = new Logger(PromotionsService.name);

    constructor(
        @InjectRepository(PricingPlan)
        private pricingPlanRepo: Repository<PricingPlan>,
        @InjectRepository(ActivePlan)
        private activePlanRepo: Repository<ActivePlan>,
        @InjectRepository(Listing)
        private listingRepo: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
    ) {}

    /**
     * Get available promotion plans (e.g., Homepage, Category boosts)
     */
    async getPromotionPlans(type?: PricingPlanType): Promise<PricingPlan[]> {
        const query: any = { isActive: true };
        if (type) {
            query.type = type;
        } else {
            // Include all boost types but exclude base subscriptions
            query.type = PricingPlanType.HOMEPAGE_FEATURED; // Simplified for now, or use In()
        }
        
        return this.pricingPlanRepo.find({ 
            where: query,
            order: { price: 'ASC' }
        });
    }

    /**
     * Check if a boost is active for a specific target
     */
    async getActiveBoosts(targetId: string): Promise<ActivePlan[]> {
        return this.activePlanRepo.find({
            where: {
                targetId,
                status: ActivePlanStatus.ACTIVE,
                endDate: MoreThan(new Date()),
            },
            relations: ['plan']
        });
    }

    /**
     * Activate a boost for a listing/offer
     * (Normally called after a successful transaction)
     */
    async activateBoost(
        vendorId: string,
        planId: string,
        targetId: string,
        transactionId?: string,
    ): Promise<ActivePlan> {
        const plan = await this.pricingPlanRepo.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Promotion plan not found');

        const now = new Date();
        const endDate = new Date(now);

        // Calculate end date based on plan duration
        switch (plan.unit) {
            case PricingPlanUnit.MINUTES:
                endDate.setMinutes(endDate.getMinutes() + plan.duration);
                break;
            case PricingPlanUnit.HOURS:
                endDate.setHours(endDate.getHours() + plan.duration);
                break;
            case PricingPlanUnit.DAYS:
                endDate.setDate(endDate.getDate() + plan.duration);
                break;
            case PricingPlanUnit.MONTHS:
                endDate.setMonth(endDate.getMonth() + plan.duration);
                break;
            case PricingPlanUnit.YEARS:
                endDate.setFullYear(endDate.getFullYear() + plan.duration);
                break;
        }

        const activePlan = this.activePlanRepo.create({
            vendorId,
            planId,
            targetId,
            status: ActivePlanStatus.ACTIVE,
            startDate: now,
            endDate,
            amountPaid: plan.price,
            transactionId,
        });

        const saved = await this.activePlanRepo.save(activePlan);
        
        // If it's a listing boost, we might want to sync some flags for faster querying
        if (plan.type === PricingPlanType.HOMEPAGE_FEATURED || plan.type === PricingPlanType.CATEGORY_FEATURED) {
            await this.listingRepo.update(targetId, { isFeatured: true });
        }

        return saved;
    }
}
