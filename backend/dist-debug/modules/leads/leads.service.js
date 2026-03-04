"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lead_entity_1 = require("../../entities/lead.entity");
const business_entity_1 = require("../../entities/business.entity");
const vendor_entity_1 = require("../../entities/vendor.entity");
const user_entity_1 = require("../../entities/user.entity");
const pagination_util_1 = require("../../common/utils/pagination.util");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let LeadsService = class LeadsService {
    constructor(leadRepository, listingRepository, vendorRepository, notificationsGateway, notificationsService) {
        this.leadRepository = leadRepository;
        this.listingRepository = listingRepository;
        this.vendorRepository = vendorRepository;
        this.notificationsGateway = notificationsGateway;
        this.notificationsService = notificationsService;
    }
    async create(createLeadDto, user, meta) {
        const { businessId } = createLeadDto;
        const listing = await this.listingRepository.findOne({
            where: { id: businessId },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        const lead = this.leadRepository.create({
            ...createLeadDto,
            userId: user?.id,
            status: lead_entity_1.LeadStatus.NEW,
            ipAddress: meta?.ipAddress,
            userAgent: meta?.userAgent,
            referrer: meta?.referrer,
        });
        const savedLead = await this.leadRepository.save(lead);
        await this.listingRepository.increment({ id: businessId }, 'totalLeads', 1);
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
    async findAllForVendor(userId, getLeadsDto) {
        const { page = 1, limit = 20, businessId, type, status } = getLeadsDto;
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });
        if (!vendor) {
            throw new common_1.ForbiddenException('Only vendors can view their leads');
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
        return (0, pagination_util_1.createPaginatedResponse)(leads, page, limit, total);
    }
    async findAllForUser(userId, getLeadsDto) {
        const { page = 1, limit = 20, type, status } = getLeadsDto;
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
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
        return (0, pagination_util_1.createPaginatedResponse)(leads, page, limit, total);
    }
    async findOne(id, userId) {
        const lead = await this.leadRepository.findOne({
            where: { id },
            relations: ['business', 'listing.vendor'],
        });
        if (!lead) {
            throw new common_1.NotFoundException('Lead not found');
        }
        if (lead.business.vendor.userId !== userId) {
            const user = await this.vendorRepository.manager.findOne(user_entity_1.User, { where: { id: userId } });
            if (user?.role !== user_entity_1.UserRole.ADMIN) {
                throw new common_1.ForbiddenException('You do not have permission to view this lead');
            }
        }
        return lead;
    }
    async updateStatus(id, updateLeadStatusDto, userId) {
        const lead = await this.findOne(id, userId);
        if (updateLeadStatusDto.status === lead_entity_1.LeadStatus.CONTACTED && !lead.contactedAt) {
            lead.contactedAt = new Date();
        }
        if (updateLeadStatusDto.status === lead_entity_1.LeadStatus.CONVERTED && !lead.convertedAt) {
            lead.convertedAt = new Date();
        }
        Object.assign(lead, updateLeadStatusDto);
        return this.leadRepository.save(lead);
    }
    async getVendorLeadStats(userId) {
        const vendor = await this.vendorRepository.findOne({
            where: { userId },
        });
        if (!vendor) {
            throw new common_1.ForbiddenException('Only vendors can view stats');
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
    async replyToEnquiry(leadId, replyMessage, vendorUserId) {
        const lead = await this.leadRepository.findOne({
            where: { id: leadId },
            relations: ['business', 'business.vendor'],
        });
        if (!lead)
            throw new common_1.NotFoundException('Enquiry not found');
        if (lead.business.vendor.userId !== vendorUserId) {
            throw new common_1.ForbiddenException('You can only reply to your own enquiries');
        }
        lead.vendorReply = replyMessage;
        lead.vendorRepliedAt = new Date();
        lead.status = lead_entity_1.LeadStatus.CONTACTED;
        const saved = await this.leadRepository.save(lead);
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
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lead_entity_1.Lead)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __param(2, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway,
        notifications_service_1.NotificationsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map