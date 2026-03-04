import { Request } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { GetLeadsDto } from './dto/get-leads.dto';
import { User } from '../../entities/user.entity';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    create(createLeadDto: CreateLeadDto, user: User, req: Request): Promise<import("../../entities").Lead>;
    findAll(user: User, getLeadsDto: GetLeadsDto): Promise<import("../../common").PaginatedResponse<import("../../entities").Lead>>;
    findMyEnquiries(user: User, getLeadsDto: GetLeadsDto): Promise<import("../../common").PaginatedResponse<import("../../entities").Lead>>;
    getStats(user: User): Promise<any>;
    findOne(id: string, user: User): Promise<import("../../entities").Lead>;
    updateStatus(id: string, updateLeadStatusDto: UpdateLeadStatusDto, user: User): Promise<import("../../entities").Lead>;
    replyToEnquiry(id: string, message: string, user: User): Promise<import("../../entities").Lead>;
}
