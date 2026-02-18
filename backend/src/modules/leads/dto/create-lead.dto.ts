import {
    IsString,
    IsEmail,
    IsOptional,
    IsEnum,
    IsUUID,
    IsPhoneNumber,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadType } from '../../../entities/lead.entity';

export class CreateLeadDto {
    @ApiProperty({ description: 'Business UUID' })
    @IsUUID()
    businessId: string;

    @ApiProperty({ enum: LeadType, example: LeadType.CHAT })
    @IsEnum(LeadType)
    type: LeadType;

    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @ApiPropertyOptional({ example: 'john@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'I am interested in your services' })
    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(1000)
    message?: string;

    @ApiPropertyOptional({ example: 'web-listing' })
    @IsOptional()
    @IsString()
    source?: string;
}
