import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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
    async calculatePrice(@Body() dto: CalculatePriceDto) {
        return this.promotionsService.calculatePrice(dto);
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
}
