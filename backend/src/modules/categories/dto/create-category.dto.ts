import {
    IsString,
    IsOptional,
    IsUUID,
    IsEnum,
    IsInt,
    IsUrl,
    MinLength,
    MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus } from '../../../entities/category.entity';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Restaurants' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ example: 'restaurants', description: 'Auto-generated from name if empty' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    slug?: string;

    @ApiPropertyOptional({ example: 'Find the best restaurants in your area' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'utensils' })
    @IsOptional()
    @IsString()
    icon?: string;

    @ApiPropertyOptional({ example: 'https://example.com/images/restaurants.jpg' })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiPropertyOptional({ description: 'Parent category UUID for subcategories' })
    @IsOptional()
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsUUID()
    parentId?: string;


    @ApiPropertyOptional({ example: 1, description: 'Display order (lower = first)' })
    @IsOptional()
    @IsInt()
    displayOrder?: number = 0;

    @ApiPropertyOptional({ enum: CategoryStatus, default: CategoryStatus.ACTIVE })
    @IsOptional()
    @IsEnum(CategoryStatus)
    status?: CategoryStatus = CategoryStatus.ACTIVE;

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
