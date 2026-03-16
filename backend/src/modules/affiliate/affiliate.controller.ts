import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseGuards,
    Param,
} from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayoutStatus } from '../../entities/payout.entity';

@ApiTags('affiliate')
@Controller('affiliate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AffiliateController {
    constructor(private readonly affiliateService: AffiliateService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get affiliate stats and balance' })
    async getStats(@CurrentUser() user: User) {
        return this.affiliateService.getStats(user.id);
    }

    @Post('join')
    @ApiOperation({ summary: 'Join the affiliate program' })
    async join(@CurrentUser() user: User) {
        return this.affiliateService.join(user.id);
    }

    @Get('referrals')
    @ApiOperation({ summary: 'Get recent referral history' })
    async getReferrals(@CurrentUser() user: User) {
        return this.affiliateService.getReferrals(user.id);
    }

    @Post('payouts')
    @ApiOperation({ summary: 'Request a withdrawal' })
    async requestPayout(
        @CurrentUser() user: User,
        @Body() body: { amount: number; method: string; details: string },
    ) {
        return this.affiliateService.requestPayout(user.id, body.amount, body.method, body.details);
    }

    @Get('payouts')
    @ApiOperation({ summary: 'Get payout history' })
    async getPayoutHistory(@CurrentUser() user: User) {
        return this.affiliateService.getPayoutHistory(user.id);
    }

    // --- Admin Endpoints ---

    @Get('admin/stats')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: Get system-wide affiliate stats' })
    async adminGetStats() {
        return this.affiliateService.adminGetAllStats();
    }

    @Get('admin/payouts')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: Get all payout requests' })
    async adminGetPayouts() {
        return this.affiliateService.adminGetAllPayouts();
    }

    @Patch('admin/payouts/:id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: Update payout status' })
    async adminUpdatePayout(
        @Param('id') id: string,
        @Body() body: { status: PayoutStatus; notes?: string },
    ) {
        return this.affiliateService.adminUpdatePayout(id, body.status, body.notes);
    }

    @Get('admin/affiliates')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: List all affiliates' })
    async adminGetAffiliates() {
        return this.affiliateService.adminGetAllAffiliates();
    }

    @Patch('admin/settings')
    @UseGuards(RolesGuard)
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    @ApiOperation({ summary: 'Admin: Update affiliate program settings' })
    async adminUpdateSettings(@Body() settings: { 
        commissionRate: string; 
        commissionType: string;
        checkinReward: string; 
        checkinType: string;
        validityMonths: string;
        expiryDate: string 
    }) {
        return this.affiliateService.adminUpdateSettings(settings);
    }
}
