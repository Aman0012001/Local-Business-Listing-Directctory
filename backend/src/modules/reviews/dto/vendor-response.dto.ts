import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VendorResponseDto {
    @ApiProperty({ example: 'Thank you for your feedback! We appreciate your business.' })
    @IsString()
    @MinLength(10, { message: 'Response must be at least 10 characters long' })
    response: string;
}
