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
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { SearchBusinessDto } from './dto/search-business.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('businesses')
@Controller('businesses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessesController {
    constructor(private readonly businessesService: BusinessesService) { }

    @Post()
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new business (Vendor only)' })
    @ApiResponse({ status: 201, description: 'Business created successfully' })
    @ApiResponse({ status: 403, description: 'Only vendors can create businesses' })
    create(
        @Body() createBusinessDto: CreateBusinessDto,
        @CurrentUser() user: User,
    ) {
        return this.businessesService.create(createBusinessDto, user);
    }

    @Public()
    @Get('search')
    @ApiOperation({ summary: 'Search businesses with filters and geo-location' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    search(@Query() searchDto: SearchBusinessDto) {
        return this.businessesService.search(searchDto);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get business by slug' })
    @ApiResponse({ status: 200, description: 'Business found' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    findBySlug(@Param('slug') slug: string) {
        return this.businessesService.findBySlug(slug);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get business by ID' })
    @ApiResponse({ status: 200, description: 'Business found' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    findOne(@Param('id', ParseUuidPipe) id: string) {
        return this.businessesService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update business (Owner or Admin only)' })
    @ApiResponse({ status: 200, description: 'Business updated successfully' })
    @ApiResponse({ status: 403, description: 'You can only update your own businesses' })
    @ApiResponse({ status: 404, description: 'Business not found' })
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
    @ApiOperation({ summary: 'Delete business (Owner or Admin only)' })
    @ApiResponse({ status: 204, description: 'Business deleted successfully' })
    @ApiResponse({ status: 403, description: 'You can only delete your own businesses' })
    @ApiResponse({ status: 404, description: 'Business not found' })
    remove(@Param('id', ParseUuidPipe) id: string, @CurrentUser() user: User) {
        return this.businessesService.remove(id, user);
    }

    @Get('vendor/my-businesses')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current vendor businesses' })
    @ApiResponse({ status: 200, description: 'Vendor businesses retrieved' })
    getMyBusinesses(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.businessesService.getVendorBusinesses(user.id, page, limit);
    }

    @Public()
    @Get(':idOrSlug/similar')
    @ApiOperation({ summary: 'Get similar businesses' })
    @ApiResponse({ status: 200, description: 'Similar businesses retrieved' })
    getSimilar(@Param('idOrSlug') idOrSlug: string, @Query('limit') limit?: number) {
        return this.businessesService.getSimilar(idOrSlug, limit);
    }
}
