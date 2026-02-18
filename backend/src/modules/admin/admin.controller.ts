import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ModerateBusinessDto, ModerateReviewDto } from './dto/moderate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get global site statistics' })
    @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
    getStats() {
        return this.adminService.getGlobalStats();
    }

    @Patch('business/:id/moderate')
    @ApiOperation({ summary: 'Approve, reject, or suspend a business' })
    @ApiResponse({ status: 200, description: 'Business status updated' })
    moderateBusiness(
        @Param('id', ParseUuidPipe) id: string,
        @Body() dto: ModerateBusinessDto,
    ) {
        return this.adminService.moderateBusiness(id, dto);
    }

    @Patch('review/:id/moderate')
    @ApiOperation({ summary: 'Approve or hide a review' })
    @ApiResponse({ status: 200, description: 'Review status updated' })
    moderateReview(
        @Param('id', ParseUuidPipe) id: string,
        @Body() dto: ModerateReviewDto,
    ) {
        return this.adminService.moderateReview(id, dto);
    }

    @Post('vendor/:id/verify')
    @ApiOperation({ summary: 'Verify or unverify a vendor' })
    @ApiResponse({ status: 200, description: 'Vendor verification updated' })
    verifyVendor(
        @Param('id', ParseUuidPipe) id: string,
        @Query('status') status: string,
    ) {
        return this.adminService.verifyVendor(id, status === 'true');
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all user records' })
    @ApiResponse({ status: 200, description: 'Full user list retrieved' })
    getUsers(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.adminService.getAllUsers(page, limit);
    }
}
