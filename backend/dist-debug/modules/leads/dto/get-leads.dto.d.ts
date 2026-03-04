import { PaginationDto } from '../../../common/dto/pagination.dto';
import { LeadType, LeadStatus } from '../../../entities/lead.entity';
export declare class GetLeadsDto extends PaginationDto {
    businessId?: string;
    type?: LeadType;
    status?: LeadStatus;
}
