import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(1, { message: 'Password is required' })
    password: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[0-9\-\s()]{7,20}$/, { message: 'Invalid phone number format' })
    phone?: string;
}
