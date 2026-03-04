import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from '../../entities/lead.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { GetLeadsDto } from './dto/get-leads.dto';
import {
    createPaginatedResponse,
    calculateSkip,
} from '../../common/utils/pagination.util';

import { NotificationsGateway } from '../notifications/notifications.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LeadsService {
    constructor(
        @InjectRepository(Lead)
        private leadRepository: Repository<Lead>,
        @InjectRepository(Listing)
        private readonly listingRepository: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        private notificationsGateway: NotificationsGateway,
        private notificationsService: NotificationsService,
    ) { }

    /**
     * Create a new lead (Customer interaction)
     */
    async create(
        createLeadDto: CreateLeadDto,
        user?: User,
        meta?: { ipAddress?: string; userAgent?: string; referrer?: string },
    ): Promise<Lead> {
        const { businessId } = createLeadDto;

        const listing = await this.listingRepository.findOne({
            where: { id: businessId },
        });

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        const lead = this.leadRepository.create({
            ...createLeadDto,
            userId: user?.id,
            status: LeadStatus.NEW,
            ipAddress: meta?.ipAddress,
            userAgent: meta?.userAgent,
            referrer: meta?.referrer,
        });

        const savedLead = await this.leadRepository.save(lead);

        // Increment lead counter on business
        await this.listingRepository.increment({ id: businessId }, 'totalLeads', 1);

        // Notify vendor in real-time
        const vendor = await this.vendorRepository.findOne({
            where: { id: listing.vendorId },
        });

        if (vendor) {
            this.notificationsGateway.sendToUser(vendor.userId, 'new_lead', {
                leadId: savedLead.id,
                businessName: listing.title,
                customerName: savedLead.name,
                type: savedLead.type,
                createdAt: savedLead.createdAt,
            });
        }

        return savedLead;
    }

    /**
     * Get leads for a vendor (Vendor dashboard)
     */
    async findAllForVendor(userId: string, getLeadsDto: GetLeadsDto) {
        const { page = 1, limit = 20, businessId, type, status } = getLeadsDto;
        const skip = calculateSkip(page, limit);

        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });

        if (!vendor) {
            throw new ForbiddenException('Only vendors can view their leads');
        }

        const queryBuilder = this.leadRepository
            .createQueryBuilder('lead')
            .innerJoin('lead.business', 'business')
            .where('business.vendorId = :vendorId', { vendorId: vendor.id });

        if (businessId) {
            queryBuilder.andWhere('lead.businessId = :businessId', { businessId });
        }

        if (type) {
            queryBuilder.andWhere('lead.type = :type', { type });
        }

        if (status) {
            queryBuilder.andWhere('lead.status = :status', { status });
        }

        queryBuilder.orderBy('lead.createdAt', 'DESC');

        const total = await queryBuilder.getCount();
        const leads = await queryBuilder.skip(skip).take(limit).getMany();

        return createPaginatedResponse(leads, page, limit, total);
    }

    /**
     * Get leads for a user (User dashboard)
     */
    async findAllForUser(userId: string, getLeadsDto: GetLeadsDto) {
        const { page = 1, limit = 20, type, status } = getLeadsDto;
        const skip = calculateSkip(page, limit);

        const queryBuilder = this.leadRepository
            .createQueryBuilder('lead')
            .leftJoinAndSelect('lead.business', 'business')
            .where('lead.userId = :userId', { userId });

        if (type) {
            queryBuilder.andWhere('lead.type = :type', { type });
        }

        if (status) {
            queryBuilder.andWhere('lead.status = :status', { status });
        }

        queryBuilder.orderBy('lead.createdAt', 'DESC');

        const total = await queryBuilder.getCount();
        const leads = await queryBuilder.skip(skip).take(limit).getMany();

        return createPaginatedResponse(leads, page, limit, total);
    }

    /**
     * Get lead by ID
     */
    async findOne(id: string, userId: string): Promise<Lead> {
        const lead = await this.leadRepository.findOne({
            where: { id },
            relations: ['business', 'listing.vendor'],
        });

        if (!lead) {
            throw new NotFoundException('Lead not found');
        }

        // Check permissions (Only owner vendor or admin)
        if (lead.business.vendor.userId !== userId) {
            const user = await this.vendorRepository.manager.findOne(User, { where: { id: userId } });
            if (user?.role !== UserRole.ADMIN) {
                throw new ForbiddenException('You do not have permission to view this lead');
            }
        }

        return lead;
    }

    /**
     * Update lead status (Vendor action)
     */
    async updateStatus(
        id: string,
        updateLeadStatusDto: UpdateLeadStatusDto,
        userId: string,
    ): Promise<Lead> {
        const lead = await this.findOne(id, userId);

        if (updateLeadStatusDto.status === LeadStatus.CONTACTED && !lead.contactedAt) {
            lead.contactedAt = new Date();
        }

        if (updateLeadStatusDto.status === LeadStatus.CONVERTED && !lead.convertedAt) {
            lead.convertedAt = new Date();
        }

        Object.assign(lead, updateLeadStatusDto);
        return this.leadRepository.save(lead);
    }

    /**
     * Get basic stats for a vendor
     */
    async getVendorLeadStats(userId: string) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });

        if (!vendor) {
            throw new ForbiddenException('Only vendors can view stats');
        }

        const stats = await this.leadRepository
            .createQueryBuilder('lead')
            .innerJoin('lead.business', 'business')
            .select('lead.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('business.vendorId = :vendorId', { vendorId: vendor.id })
            .groupBy('lead.status')
            .getRawMany();

        return stats.reduce((acc, curr) => {
            acc[curr.status] = parseInt(curr.count);
            return acc;
        }, {});
    }
    /**
     * Vendor replies to a user enquiry
     */
    async replyToEnquiry(
        leadId: string,
        replyMessage: string,
        vendorUserId: string,
    ): Promise<Lead> {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
            relations: ['business', 'business.vendor'],
        });

        if (!lead) throw new NotFoundException('Enquiry not found');
        if (lead.business.vendor.userId !== vendorUserId) {
            throw new ForbiddenException('You can only reply to your own enquiries');
        }

        lead.vendorReply = replyMessage;
        lead.vendorRepliedAt = new Date();
        lead.status = LeadStatus.CONTACTED;
        const saved = await this.leadRepository.save(lead);

        // Notify the user who sent the enquiry (if they have an account)
        if (lead.userId) {
            await this.notificationsService.create({
                userId: lead.userId,
                title: '💬 Vendor Replied to Your Enquiry',
                message: `${lead.business.title} has replied to your enquiry: "${replyMessage.slice(0, 80)}${replyMessage.length > 80 ? '...' : ''}"`,
                type: 'enquiry_reply',
                data: { leadId: lead.id, businessId: lead.businessId, slug: lead.business.slug },
            });
        }

        return saved;
    }
}
