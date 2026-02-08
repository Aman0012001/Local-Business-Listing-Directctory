import {
    IsString,
    IsEmail,
    IsOptional,
    IsPhoneNumber,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName?: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @ApiPropertyOptional({ example: 'New York' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ example: 'NY' })
    @IsOptional()
    @IsString()
    state?: string;
}
