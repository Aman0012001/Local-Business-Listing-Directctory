import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(50, { message: 'Password must not exceed 50 characters' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain uppercase, lowercase, and number/special character',
    })
    password: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @MinLength(2, { message: 'Full name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
    fullName: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone?: string;
}
