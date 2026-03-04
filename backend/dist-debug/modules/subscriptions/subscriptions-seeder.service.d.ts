import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
export declare class SubscriptionsSeederService implements OnModuleInit {
    private planRepository;
    private configService;
    private readonly logger;
    constructor(planRepository: Repository<SubscriptionPlan>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    seedPlans(): Promise<void>;
}
