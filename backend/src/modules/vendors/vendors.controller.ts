import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VendorsController {
    constructor(private readonly vendorsService: VendorsService) { }

    @Post('become-vendor')
    @ApiOperation({ summary: 'Register the current user as a vendor' })
    @ApiResponse({ status: 201, description: 'Vendor profile created' })
    becomeVendor(@CurrentUser() user: User, @Body() createVendorDto: CreateVendorDto) {
        return this.vendorsService.becomeVendor(user.id, createVendorDto);
    }

    @Get('profile')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get current vendor profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved' })
    getProfile(@CurrentUser() user: User) {
        return this.vendorsService.getProfile(user.id);
    }

    @Patch('profile')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Update current vendor profile' })
    @ApiResponse({ status: 200, description: 'Profile updated' })
    updateProfile(@CurrentUser() user: User, @Body() updateVendorDto: UpdateVendorDto) {
        return this.vendorsService.updateProfile(user.id, updateVendorDto);
    }

    @Get('dashboard-stats')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get overview stats for the vendor dashboard' })
    @ApiResponse({ status: 200, description: 'Stats retrieved' })
    getStats(@CurrentUser() user: User) {
        return this.vendorsService.getDashboardStats(user.id);
    }

    @Post('verify')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Submit verification documents' })
    @ApiResponse({ status: 200, description: 'Documents submitted' })
    submitVerification(@CurrentUser() user: User, @Body() documents: any) {
        return this.vendorsService.submitVerification(user.id, documents);
    }
}
