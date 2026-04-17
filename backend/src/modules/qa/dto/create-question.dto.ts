import { IsString, IsNotEmpty, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    businessId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    content: string;
}
