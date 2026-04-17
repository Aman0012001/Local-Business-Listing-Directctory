import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QAStatus } from '../../../entities/qa.enums';

export class ModerateQaDto {
    @ApiProperty({ enum: QAStatus })
    @IsEnum(QAStatus)
    @IsNotEmpty()
    status: QAStatus;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    reason?: string;
}
