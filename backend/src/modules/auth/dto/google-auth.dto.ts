import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
    @ApiProperty({ description: 'Google credential token is required' })
    @IsString()
    @IsNotEmpty({ message: 'Google credential token is required' })
    credential: string;

    @ApiProperty({ description: 'Optional role for the user (user or vendor)', required: false })
    @IsString()
    @IsOptional()
    role?: string;

    @ApiProperty({ description: 'Optional referral code', required: false })
    @IsString()
    @IsOptional()
    referralCode?: string;
}
