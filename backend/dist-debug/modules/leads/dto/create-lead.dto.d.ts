import { LeadType } from '../../../entities/lead.entity';
export declare class CreateLeadDto {
    businessId: string;
    type: LeadType;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: string;
}
