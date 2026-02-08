import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessStatus } from '../../../entities/business.entity';

export enum AdminAction {
    APPROVE = 'approve',
    REJECT = 'reject',
    SUSPEND = 'suspend',
}

export class ModerateBusinessDto {
    @ApiProperty({ enum: BusinessStatus })
    @IsEnum(BusinessStatus)
    status: BusinessStatus;

    @ApiProperty({ example: 'Documents verified, all looks good.' })
    @IsOptional()
    @IsString()
    reason?: string;
}

export class ModerateReviewDto {
    @ApiProperty({ example: true })
    isApproved: boolean;
}
