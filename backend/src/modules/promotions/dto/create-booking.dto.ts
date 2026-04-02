import { IsEnum, IsUUID, IsArray, IsDateString, IsOptional } from 'class-validator';
import { PromotionPlacement } from '../../../entities/promotion-pricing-rule.entity';

export class CalculatePriceDto {
    @IsArray()
    @IsEnum(PromotionPlacement, { each: true })
    placements: PromotionPlacement[];

    @IsOptional()
    @IsDateString()
    startTime?: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsUUID()
    offerEventId?: string;
}

export class CreateBookingDto extends CalculatePriceDto {
    @IsUUID()
    offerEventId: string;

    @IsOptional()
    @IsUUID()
    businessId?: string; 

    @IsOptional()
    @IsUUID()
    pricingId?: string; // ID of a Booster Plan (PricingPlan)
}
