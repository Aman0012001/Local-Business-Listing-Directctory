import {
    IsString,
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
    @ApiProperty({ example: 'My Awesome Shop' })
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    businessName: string;

    @ApiPropertyOptional({ example: 'contact@mybusiness.com' })
    @IsOptional()
    @IsEmail()
    businessEmail?: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    @MinLength(8)
    businessPhone: string;

    @ApiPropertyOptional({ example: '123 Business Rd, Office 4B' })
    @IsOptional()
    @IsString()
    businessAddress?: string;

    @ApiPropertyOptional({ example: 'GSTIN123456789' })
    @IsOptional()
    @IsString()
    gstNumber?: string;

    @ApiPropertyOptional({ example: 'PANABCDE1234' })
    @IsOptional()
    @IsString()
    panNumber?: string;
}

export class UpdateVendorDto {
    @ApiPropertyOptional({ example: 'Updated Business Name' })
    @IsOptional()
    @IsString()
    businessName?: string;

    @ApiPropertyOptional({ example: 'newemail@business.com' })
    @IsOptional()
    @IsEmail()
    businessEmail?: string;

    @ApiPropertyOptional({ example: '+9876543210' })
    @IsOptional()
    @IsString()
    businessPhone?: string;

    @ApiPropertyOptional({ example: 'New Address' })
    @IsOptional()
    @IsString()
    businessAddress?: string;
}
