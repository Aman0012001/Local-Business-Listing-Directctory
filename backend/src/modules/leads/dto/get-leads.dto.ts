import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { LeadType, LeadStatus } from '../../../entities/lead.entity';

export class GetLeadsDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'Filter by business UUID' })
    @IsOptional()
    @IsUUID()
    businessId?: string;

    @ApiPropertyOptional({ enum: LeadType })
    @IsOptional()
    @IsEnum(LeadType)
    type?: LeadType;

    @ApiPropertyOptional({ enum: LeadStatus })
    @IsOptional()
    @IsEnum(LeadStatus)
    status?: LeadStatus;
}
