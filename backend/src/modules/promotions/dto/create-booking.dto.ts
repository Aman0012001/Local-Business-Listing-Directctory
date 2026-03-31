import { IsEnum, IsUUID, IsArray, IsDateString, IsOptional, ArrayNotEmpty } from 'class-validator';
import { PromotionPlacement } from '../../../entities/promotion-pricing-rule.entity';

export class CalculatePriceDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(PromotionPlacement, { each: true })
    placements: PromotionPlacement[];

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;
}

export class CreateBookingDto extends CalculatePriceDto {
    @IsUUID()
    offerEventId: string;

    @IsOptional()
    @IsUUID()
    businessId?: string; // Optional if we want to infer from offerEvent
}
