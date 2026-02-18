import {
    IsString,
    IsEnum,
    IsUUID,
    IsOptional,
    IsNumber,
    IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlanType } from '../../../entities/subscription-plan.entity';

export class CreatePlanDto {
    @ApiProperty({ example: 'Premium Plan' })
    @IsString()
    name: string;

    @ApiProperty({ enum: SubscriptionPlanType, example: SubscriptionPlanType.PREMIUM })
    @IsEnum(SubscriptionPlanType)
    planType: SubscriptionPlanType;

    @ApiProperty({ example: 499.00 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 'monthly' })
    @IsString()
    billingCycle: string;

    @ApiProperty({ example: ['Priority Support', 'Featured Listing', 'Extended Analytics'] })
    @IsArray()
    @IsString({ each: true })
    features: string[];

    @ApiProperty({ example: 5 })
    @IsNumber()
    maxListings: number;

    @ApiProperty({ default: false })
    @IsOptional()
    isFeatured?: boolean = false;

    @ApiProperty({ default: false })
    @IsOptional()
    isSponsored?: boolean = false;

    @ApiPropertyOptional({ example: 'price_123...' })
    @IsString()
    @IsOptional()
    stripePriceId?: string;
}

export class CheckoutDto {
    @ApiProperty({ description: 'Plan UUID' })
    @IsUUID()
    planId: string;

    @ApiProperty({ example: 'monthly' })
    @IsString()
    cycle: string;
}
