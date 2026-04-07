import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    UseGuards,
    Req,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { CalculatePriceDto, CreateBookingDto } from './dto/create-booking.dto';

@Controller('promotions')
export class PromotionsController {
    constructor(private readonly promotionsService: PromotionsService) {}

    @Get('pricing-rules')
    async getPricingRules() {
        return this.promotionsService.getPricingRules();
    }

    @Post('calculate')
    @UseGuards(JwtAuthGuard)
    async calculatePrice(@Req() req, @Body() dto: CalculatePriceDto, @Query('type') type: string = 'offer') {
        return this.promotionsService.calculatePrice(dto, req.user.id, type);
    }

    @Post('book')
    @UseGuards(JwtAuthGuard)
    async createBooking(@Req() req, @Body() dto: CreateBookingDto) {
        const origin = req.get('origin');
        return this.promotionsService.createBooking(req.user.id, dto, origin);
    }

    @Get('verify-session')
    @UseGuards(JwtAuthGuard)
    async verifySession(@Req() req, @Query('session_id') sessionId: string) {
        if (!sessionId) throw new BadRequestException('Session ID is required');
        return this.promotionsService.verifySession(sessionId, req.user.id);
    }

    // --- Admin Endpoints ---
    @Get('admin/rules')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    async adminGetRules() {
        return this.promotionsService.getPricingRules();
    }

    @Patch('admin/rules/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    async updateRule(@Param('id') id: string, @Body() dto: { pricePerHour?: number, basePrice?: number, isActive?: boolean }) {
        return this.promotionsService.updatePricingRule(id, dto);
    }
}
