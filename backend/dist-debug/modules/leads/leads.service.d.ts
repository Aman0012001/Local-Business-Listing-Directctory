import { Repository } from 'typeorm';
import { Lead } from '../../entities/lead.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User } from '../../entities/user.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { GetLeadsDto } from './dto/get-leads.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';
export declare class LeadsService {
    private leadRepository;
    private readonly listingRepository;
    private vendorRepository;
    private notificationsGateway;
    private notificationsService;
    constructor(leadRepository: Repository<Lead>, listingRepository: Repository<Listing>, vendorRepository: Repository<Vendor>, notificationsGateway: NotificationsGateway, notificationsService: NotificationsService);
    create(createLeadDto: CreateLeadDto, user?: User, meta?: {
        ipAddress?: string;
        userAgent?: string;
        referrer?: string;
    }): Promise<Lead>;
    findAllForVendor(userId: string, getLeadsDto: GetLeadsDto): Promise<import("../../common").PaginatedResponse<Lead>>;
    findAllForUser(userId: string, getLeadsDto: GetLeadsDto): Promise<import("../../common").PaginatedResponse<Lead>>;
    findOne(id: string, userId: string): Promise<Lead>;
    updateStatus(id: string, updateLeadStatusDto: UpdateLeadStatusDto, userId: string): Promise<Lead>;
    getVendorLeadStats(userId: string): Promise<any>;
    replyToEnquiry(leadId: string, replyMessage: string, vendorUserId: string): Promise<Lead>;
}
