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
    UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { BusinessesService } from './businesses.service';
import { SearchService } from '../search/search.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SearchBusinessDto } from './dto/search-business.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CheckFeature } from '../../common/decorators/check-feature.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FeatureGateGuard } from '../../common/guards/feature-gate.guard';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('businesses')
@Controller('businesses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessesController {
    constructor(
        private readonly businessesService: BusinessesService,
        private readonly searchService: SearchService,
        private readonly affiliateService: AffiliateService,
    ) { }

    @Post()
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @UseGuards(FeatureGateGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new listing (Vendor only)' })
    @ApiResponse({ status: 201, description: 'Listing created successfully' })
    @ApiResponse({ status: 403, description: 'Only vendors can create listings' })
    create(
        @Body() createBusinessDto: CreateBusinessDto,
        @CurrentUser() user: User,
    ) {
        return this.businessesService.create(createBusinessDto, user);
    }

    @Patch(':id/image')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update business listing image URL' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                imageUrl: {
                    type: 'string',
                    description: 'The Cloudinary URL of the uploaded image',
                },
            },
            required: ['imageUrl'],
        },
    })
    async updateImageUrl(
        @Param('id', ParseUuidPipe) id: string,
        @Body('imageUrl') imageUrl: string,
        @CurrentUser() user: User,
    ) {
        return this.businessesService.updateImage(id, imageUrl, user);
    }

    @Public()
    @UseInterceptors(CacheInterceptor)
    @Get('search')
    @ApiOperation({ summary: 'Search listings with filters and geo-location' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    search(@Query() searchDto: SearchBusinessDto) {
        return this.businessesService.search(searchDto);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get listing by slug' })
    @ApiResponse({ status: 200, description: 'Listing found' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    findBySlug(@Param('slug') slug: string, @CurrentUser() user?: User) {
        return this.businessesService.findBySlug(slug, user);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @UseInterceptors(CacheInterceptor)
    @Get(':id')
    @ApiOperation({ summary: 'Get listing by ID' })
    @ApiResponse({ status: 200, description: 'Listing found' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    findOne(@Param('id', ParseUuidPipe) id: string, @CurrentUser() user?: User) {
        return this.businessesService.findOne(id, user);
    }

    @Patch(':id')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update listing (Owner or Admin only)' })
    @ApiResponse({ status: 200, description: 'Listing updated successfully' })
    @ApiResponse({ status: 403, description: 'Unauthorized access' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    update(
        @Param('id', ParseUuidPipe) id: string,
        @Body() updateBusinessDto: UpdateBusinessDto,
        @CurrentUser() user: User,
    ) {
        return this.businessesService.update(id, updateBusinessDto, user);
    }

    @Delete(':id')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete listing (Owner or Admin only)' })
    @ApiResponse({ status: 204, description: 'Listing deleted successfully' })
    @ApiResponse({ status: 403, description: 'Unauthorized access' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    remove(@Param('id', ParseUuidPipe) id: string, @CurrentUser() user: User) {
        return this.businessesService.remove(id, user);
    }

    @Get('vendor/my-listings')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current vendor listings' })
    @ApiResponse({ status: 200, description: 'Vendor listings retrieved' })
    getMyBusinesses(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.businessesService.getVendorBusinesses(user.id, page, limit);
    }

    @Public()
    @Get(':idOrSlug/similar')
    @ApiOperation({ summary: 'Get similar listings' })
    @ApiResponse({ status: 200, description: 'Similar listings retrieved' })
    getSimilar(@Param('idOrSlug') idOrSlug: string, @Query('limit') limit?: number) {
        return this.businessesService.getSimilar(idOrSlug, limit);
    }

    @Public()
    @Get('amenities/all')
    @ApiOperation({ summary: 'Get all available amenities' })
    getAllAmenities() {
        return this.businessesService.getAllAmenities();
    }

    @Post('amenities')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new amenity' })
    createAmenity(@Body() data: { name: string, icon?: string }) {
        return this.businessesService.createAmenity(data.name, data.icon);
    }

    @Post('sync')
    @Public()
    async sync() {
        return this.searchService.reindexAll();
    }


}
