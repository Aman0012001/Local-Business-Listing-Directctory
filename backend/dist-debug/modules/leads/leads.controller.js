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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leads_service_1 = require("./leads.service");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_status_dto_1 = require("./dto/update-lead-status.dto");
const get_leads_dto_1 = require("./dto/get-leads.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const parse_uuid_pipe_1 = require("../../common/pipes/parse-uuid.pipe");
const user_entity_1 = require("../../entities/user.entity");
let LeadsController = class LeadsController {
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async create(createLeadDto, user, req) {
        const meta = {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            referrer: req.headers['referer'],
        };
        return this.leadsService.create(createLeadDto, user, meta);
    }
    async findAll(user, getLeadsDto) {
        return this.leadsService.findAllForVendor(user.id, getLeadsDto);
    }
    async findMyEnquiries(user, getLeadsDto) {
        return this.leadsService.findAllForUser(user.id, getLeadsDto);
    }
    async getStats(user) {
        return this.leadsService.getVendorLeadStats(user.id);
    }
    async findOne(id, user) {
        return this.leadsService.findOne(id, user.id);
    }
    async updateStatus(id, updateLeadStatusDto, user) {
        return this.leadsService.updateStatus(id, updateLeadStatusDto, user.id);
    }
    async replyToEnquiry(id, message, user) {
        return this.leadsService.replyToEnquiry(id, message, user.id);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new lead (Public/User interaction)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Lead recorded successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreateLeadDto,
        user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('vendor'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all leads for the current vendor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leads retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, get_leads_dto_1.GetLeadsDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-enquiries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all enquiries sent by the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Enquiries retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, get_leads_dto_1.GetLeadsDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findMyEnquiries", null);
__decorate([
    (0, common_1.Get)('vendor/stats'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead statistics for the current vendor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get lead details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lead details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lead not found' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update lead status (Vendor action)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lead status updated successfully' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_status_dto_1.UpdateLeadStatusDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/reply'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.VENDOR, user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor replies to an enquiry, notifying the user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply sent successfully' }),
    __param(0, (0, common_1.Param)('id', parse_uuid_pipe_1.ParseUuidPipe)),
    __param(1, (0, common_1.Body)('message')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "replyToEnquiry", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('leads'),
    (0, common_1.Controller)('leads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map