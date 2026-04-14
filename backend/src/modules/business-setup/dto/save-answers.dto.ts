import { IsArray, IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveAnswersDto {
    @ApiProperty({
        description: 'Map of question IDs or keys to selected values (string or array of strings)',
        example: { 'service-mode': ['Home Service', 'In-store'], 'payment-methods': ['Cash', 'UPI'] }
    })
    @IsObject()
    @IsNotEmpty()
    answers: Record<string, string | string[]>;
}
