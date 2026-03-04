import {
    IsString,
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Helper: treat empty strings the same as undefined so @IsEmail() etc. are skipped
const trimToUndefined = ({ value }: { value: any }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value;

export class CreateVendorDto {
    @ApiProperty({ example: 'My Awesome Shop' })
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    businessName: string;

    @ApiPropertyOptional({ example: 'contact@mybusiness.com' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsEmail()
    businessEmail?: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @MinLength(8)
    businessPhone: string;

    @ApiPropertyOptional({ example: '123 Business Rd, Office 4B' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    businessAddress?: string;

    @ApiPropertyOptional({ example: 'GSTIN123456789' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    gstNumber?: string;

    @ApiPropertyOptional({ example: '1234567-8' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    ntnNumber?: string;
}

export class UpdateVendorDto {
    @ApiPropertyOptional({ example: 'Updated Business Name' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    businessName?: string;

    @ApiPropertyOptional({ example: 'newemail@business.com' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsEmail()
    businessEmail?: string;

    @ApiPropertyOptional({ example: '+9876543210' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    businessPhone?: string;

    @ApiPropertyOptional({ example: 'New Address' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    businessAddress?: string;

    @ApiPropertyOptional({ example: 'GSTIN123456789' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    gstNumber?: string;

    @ApiPropertyOptional({ example: '1234567-8' })
    @IsOptional()
    @Transform(trimToUndefined)
    @IsString()
    ntnNumber?: string;

    @ApiPropertyOptional({ example: { monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' } } })
    @IsOptional()
    businessHours?: Record<string, { isOpen: boolean, openTime: string, closeTime: string }>;

    @ApiPropertyOptional({ example: [{ platform: 'facebook', url: 'https://facebook.com/mybusiness' }] })
    @IsOptional()
    socialLinks?: { platform: string, url: string }[];
}
