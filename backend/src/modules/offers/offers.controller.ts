import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('offers')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    // ─── Vendor Endpoints ────────────────────────────────────────────────────

    @Post('vendor/offers')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new offer or event (Vendor)' })
    @ApiResponse({ status: 201, description: 'Offer created successfully' })
    create(
        @Body() dto: CreateOfferDto,
        @CurrentUser() user: User,
    ) {
        return this.offersService.create(user.id, dto);
    }

    @Get('vendor/offers')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all offers for the authenticated vendor (paginated)' })
    @ApiResponse({ status: 200, description: 'Vendor offers list' })
    findMine(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.offersService.findByVendor(user.id, page, limit);
    }

    @Patch('vendor/offers/:id')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update an offer (Vendor owner only)' })
    @ApiResponse({ status: 200, description: 'Offer updated' })
    @ApiResponse({ status: 403, description: 'Forbidden - not your offer' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateOfferDto,
        @CurrentUser() user: User,
    ) {
        return this.offersService.update(id, user.id, dto);
    }

    @Delete('vendor/offers/:id')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete an offer (Vendor owner only)' })
    @ApiResponse({ status: 204, description: 'Offer deleted' })
    @ApiResponse({ status: 403, description: 'Forbidden - not your offer' })
    remove(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ) {
        return this.offersService.remove(id, user.id);
    }

    // ─── Public Endpoint ─────────────────────────────────────────────────────

    @Public()
    @Get('business/:businessId/offers')
    @ApiOperation({ summary: 'Get active/scheduled offers for a business (Public)' })
    @ApiResponse({ status: 200, description: 'Business offers' })
    findByBusiness(@Param('businessId') businessId: string) {
        return this.offersService.findPublicByBusiness(businessId);
    }
}
