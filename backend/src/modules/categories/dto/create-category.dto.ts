import {
    IsString,
    IsOptional,
    IsUUID,
    IsBoolean,
    IsInt,
    IsUrl,
    MinLength,
    MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Restaurants' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ example: 'Find the best restaurants in your area' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'https://example.com/icons/restaurant.svg' })
    @IsOptional()
    @IsUrl()
    iconUrl?: string;

    @ApiPropertyOptional({ description: 'Parent category UUID for subcategories' })
    @IsOptional()
    @IsUUID()
    parentId?: string;

    @ApiPropertyOptional({ example: 1, description: 'Display order (lower = first)' })
    @IsOptional()
    @IsInt()
    displayOrder?: number = 0;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiPropertyOptional({ example: 'Best Restaurants - Find Top Dining' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    metaTitle?: string;

    @ApiPropertyOptional({ example: 'Discover the best restaurants near you...' })
    @IsOptional()
    @IsString()
    metaDescription?: string;
}
