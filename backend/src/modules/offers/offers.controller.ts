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
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { SearchOfferDto } from './dto/search-offer.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('offers')
@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
    constructor(private readonly offersService: OffersService) { }

    /** Public search for offers and events */
    @Public()
    @UseInterceptors(CacheInterceptor)
    @Get('public/search')
    async findAllPublic(@Query() dto: SearchOfferDto) {
        return this.offersService.findAllPublic(dto);
    }

    @Public()
    @Get('public/pricing')
    @ApiOperation({ summary: 'Get available promotion pricing for offers/events' })
    async getPricing(@Query('type') type?: 'offer' | 'event') {
        return this.offersService.getPricing(type);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Get('vendor')
    @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
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

    @Post(':id/feature')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initiate checkout to feature an offer' })
    async featureOffer(
        @Param('id') id: string,
        @Body('pricingId') pricingId: string,
        @CurrentUser() user: User,
    ) {
        return this.offersService.createFeatureCheckoutSession(user.id, id, pricingId);
    }

    @Post(':id/verify-feature')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verify checkout session for featuring an offer' })
    async verifyFeature(
        @Param('id') id: string,
        @Body('sessionId') sessionId: string,
        @CurrentUser() user: User,
    ) {
        return this.offersService.verifyFeatureSession(sessionId, user.id);
    }

    // ─── Public Endpoint ─────────────────────────────────────────────────────

    @Public()
    @UseInterceptors(CacheInterceptor)
    @Get('business/:businessId/offers')
    @ApiOperation({ summary: 'Get active/scheduled offers for a business (Public)' })
    @ApiResponse({ status: 200, description: 'Business offers' })
    findByBusiness(@Param('businessId') businessId: string) {
        return this.offersService.findPublicByBusiness(businessId);
    }

    @Public()
    @UseInterceptors(CacheInterceptor)
    @Get('public/:id')
    @ApiOperation({ summary: 'Get a single offer or event by ID (Public)' })
    @ApiResponse({ status: 200, description: 'Offer details' })
    @ApiResponse({ status: 404, description: 'Offer not found' })
    findOnePublic(@Param('id') id: string) {
        return this.offersService.findOnePublic(id);
    }

    // ─── Admin Endpoints ─────────────────────────────────────────────────────

    @Get('admin/all')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all offers for admin management' })
    findAllAdmin(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.offersService.findAllForAdmin(page, limit);
    }

    @Patch('admin/:id/feature')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Toggle featured status of an offer' })
    toggleFeatured(
        @Param('id') id: string,
        @Body('isFeatured') isFeatured: boolean,
    ) {
        return this.offersService.toggleFeatured(id, isFeatured);
    }
}
