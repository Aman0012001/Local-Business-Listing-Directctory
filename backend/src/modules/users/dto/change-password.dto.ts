import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ example: 'old_secure_password123' })
    @IsString()
    oldPassword: string;

    @ApiProperty({ example: 'new_secure_password456' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    newPassword: string;
}
