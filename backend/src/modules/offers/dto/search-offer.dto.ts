import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType } from '../../../entities/offer-event.entity';
import { Type } from 'class-transformer';

export class SearchOfferDto {
    @ApiPropertyOptional({ example: 'sale' })
    @IsOptional()
    @IsString()
    query?: string;

    @ApiPropertyOptional({ example: 'Kuala Lumpur' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: 3.1390 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ example: 101.6869 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ example: 10, description: 'Radius in kilometers' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    radius?: number;

    @ApiPropertyOptional({ enum: OfferType, example: OfferType.OFFER })
    @IsOptional()
    @IsEnum(OfferType)
    type?: OfferType;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit? = 10;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page? = 1;
}
