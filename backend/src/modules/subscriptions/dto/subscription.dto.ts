import {
    IsString,
    IsEnum,
    IsUUID,
    IsOptional,
    IsNumber,
    IsArray,
    IsBoolean,
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
    @IsBoolean()
    isSponsored?: boolean = false;
}

export class UpdatePlanDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ enum: SubscriptionPlanType })
    @IsOptional()
    @IsEnum(SubscriptionPlanType)
    planType?: SubscriptionPlanType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    billingCycle?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    features?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    maxListings?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isSponsored?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CheckoutDto {
    @ApiProperty({ description: 'Plan UUID' })
    @IsUUID()
    planId: string;

    @ApiProperty({ example: 'monthly' })
    @IsString()
    cycle: string;
}

export class AssignPlanDto {
    @ApiProperty({ description: 'Vendor UUID' })
    @IsUUID()
    vendorId: string;

    @ApiProperty({ description: 'Plan UUID' })
    @IsUUID()
    planId: string;

    @ApiPropertyOptional({ description: 'Duration in days', default: 30 })
    @IsOptional()
    @IsNumber()
    durationDays?: number;
}

export class ChangePlanDto {
    @ApiProperty({ description: 'New Plan UUID' })
    @IsUUID()
    planId: string;
}

