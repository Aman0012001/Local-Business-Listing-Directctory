import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateReviewReplyDto {
    @ApiProperty({ example: 'Thank you for your feedback!' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(1000)
    content: string;
}
