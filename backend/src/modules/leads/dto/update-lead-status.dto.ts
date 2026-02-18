import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '../../../entities/lead.entity';

export class UpdateLeadStatusDto {
    @ApiProperty({ enum: LeadStatus })
    @IsEnum(LeadStatus)
    status: LeadStatus;

    @ApiProperty({ example: 'Called the customer, they are interested.' })
    @IsOptional()
    @IsString()
    notes?: string;
}
