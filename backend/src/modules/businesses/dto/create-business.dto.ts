import {
    IsString,
    IsEmail,
    IsOptional,
    IsNumber,
    IsArray,
    IsUUID,
    MinLength,
    MaxLength,
    Min,
    Max,
    Matches,
    IsUrl,
    ValidateNested,
    IsEnum,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '../../../entities/business-hours.entity';

export class BusinessHoursDto {
    @ApiProperty({ enum: DayOfWeek })
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @ApiProperty({ default: true })
    @IsOptional()
    isOpen?: boolean = true;

    @ApiPropertyOptional({ example: '09:00' })
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' })
    openTime?: string;

    @ApiPropertyOptional({ example: '18:00' })
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM)' })
    closeTime?: string;
}

export class FaqDto {
    @ApiProperty({ example: 'What are your working hours?' })
    @IsString()
    question: string;

    @ApiProperty({ example: 'We are open 24/7.' })
    @IsString()
    answer: string;
}

export class CreateBusinessDto {
    @ApiProperty({ example: 'Best Restaurant' })
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    title: string;

    @ApiPropertyOptional({ description: 'Category UUID (Optional if suggestedCategoryName is provided)' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ description: 'New category suggested by vendor' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    suggestedCategoryName?: string;

    @ApiProperty({ example: 'A wonderful dining experience...' })
    @IsString()
    @MinLength(10)
    description: string;

    @ApiPropertyOptional({ example: 'Great food and ambiance', maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    shortDescription?: string;

    @ApiPropertyOptional({ example: 'contact@restaurant.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @Matches(/^\+?[0-9\-\s()]{7,20}$/, { message: 'Invalid phone number' })
    phone: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[0-9\-\s()]{7,20}$/, { message: 'Invalid WhatsApp number' })
    whatsapp?: string;

    @ApiPropertyOptional({ example: 'https://restaurant.com' })
    @IsOptional()
    @IsUrl({ require_protocol: false, require_tld: false })
    website?: string;

    @ApiProperty({ example: '123 Main Street, Downtown' })
    @IsString()
    @MinLength(5)
    address: string;

    @ApiProperty({ example: 'New York' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    city: string;

    @ApiProperty({ example: 'New York' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    state: string;

    @ApiPropertyOptional({ example: 'Pakistan', default: 'Pakistan' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    country?: string = 'Pakistan';

    @ApiProperty({ example: '10001' })
    @IsString()
    @MaxLength(10)
    pincode: string;

    @ApiProperty({ example: 40.7128, description: 'Latitude' })
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ example: -74.0060, description: 'Longitude' })
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
    @IsOptional()
    @IsUrl()
    coverImageUrl?: string;

    @ApiPropertyOptional({ type: [String], example: ['https://example.com/img1.jpg'] })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    images?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    videos?: string[];

    @ApiPropertyOptional({ example: 2010 })
    @IsOptional()
    @IsInt()
    @Min(1800)
    @Max(new Date().getFullYear())
    yearEstablished?: number;

    @ApiPropertyOptional({ example: '10-50' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    employeeCount?: string;

    @ApiPropertyOptional({ example: '$$', enum: ['$', '$$', '$$$', '$$$$'] })
    @IsOptional()
    @IsString()
    priceRange?: string;

    @ApiPropertyOptional({ type: [BusinessHoursDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BusinessHoursDto)
    businessHours?: BusinessHoursDto[];

    @ApiPropertyOptional({ type: [String], description: 'Array of amenity UUIDs' })
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    amenityIds?: string[];

    @ApiPropertyOptional({ example: 'Best Restaurant in NYC' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    metaTitle?: string;

    @ApiPropertyOptional({ example: 'Find the best dining experience...' })
    @IsOptional()
    @IsString()
    metaDescription?: string;

    @ApiPropertyOptional({ example: 'restaurant, dining, food, nyc' })
    @IsOptional()
    @IsString()
    metaKeywords?: string;

    // Offer / Promo Banner
    @ApiPropertyOptional({ example: false })
    @IsOptional()
    hasOffer?: boolean;

    @ApiPropertyOptional({ example: 'Grand Opening Sale' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    offerTitle?: string;

    @ApiPropertyOptional({ example: 'Get 30% off on all services this week!' })
    @IsOptional()
    @IsString()
    offerDescription?: string;

    @ApiPropertyOptional({ example: '30% OFF' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    offerBadge?: string;

    @ApiPropertyOptional({ example: '2025-12-31' })
    @IsOptional()
    offerExpiresAt?: string;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.jpg' })
    @IsString()
    @IsOptional()
    offerBannerUrl?: string;

    @ApiPropertyOptional({ type: 'boolean', default: false })
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ type: [FaqDto] })
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FaqDto)
    faqs?: FaqDto[];
}
