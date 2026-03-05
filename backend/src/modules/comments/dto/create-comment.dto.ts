import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateCommentDto {
    @IsUUID()
    @IsNotEmpty()
    businessId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;
}
