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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @Roles(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a review' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 409, description: 'You have already reviewed this business' })
    create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
        return this.reviewsService.create(createReviewDto, user);
    }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get reviews with filters' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    findAll(@Query() getReviewsDto: GetReviewsDto) {
        return this.reviewsService.findAll(getReviewsDto);
    }

    @Public()
    @Get('business/:idOrSlug/stats')
    @ApiOperation({ summary: 'Get business rating statistics' })
    @ApiResponse({ status: 200, description: 'Rating statistics retrieved' })
    getBusinessRatingStats(@Param('idOrSlug') idOrSlug: string) {
        return this.reviewsService.getBusinessRatingStats(idOrSlug);
    }

    @Public()
    @Get('business/:idOrSlug')
    @ApiOperation({ summary: 'Get reviews by business ID or slug' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    findByBusiness(
        @Param('idOrSlug') idOrSlug: string,
        @Query() getReviewsDto: GetReviewsDto,
    ) {
        return this.reviewsService.findByBusiness(idOrSlug, getReviewsDto);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get review by ID' })
    @ApiResponse({ status: 200, description: 'Review found' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    findOne(@Param('id', ParseUuidPipe) id: string) {
        return this.reviewsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update review (Owner or Admin only)' })
    @ApiResponse({ status: 200, description: 'Review updated successfully' })
    @ApiResponse({ status: 403, description: 'You can only update your own reviews' })
    update(
        @Param('id', ParseUuidPipe) id: string,
        @Body() updateReviewDto: UpdateReviewDto,
        @CurrentUser() user: User,
    ) {
        return this.reviewsService.update(id, updateReviewDto, user);
    }

    @Delete(':id')
    @Roles(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete review (Owner or Admin only)' })
    @ApiResponse({ status: 204, description: 'Review deleted successfully' })
    @ApiResponse({ status: 403, description: 'You can only delete your own reviews' })
    remove(@Param('id', ParseUuidPipe) id: string, @CurrentUser() user: User) {
        return this.reviewsService.remove(id, user);
    }

    @Post(':id/vendor-response')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add vendor response to review (Vendor only)' })
    @ApiResponse({ status: 200, description: 'Vendor response added successfully' })
    @ApiResponse({ status: 403, description: 'Only the business owner can respond' })
    addVendorResponse(
        @Param('id', ParseUuidPipe) id: string,
        @Body() vendorResponseDto: VendorResponseDto,
        @CurrentUser() user: User,
    ) {
        return this.reviewsService.addVendorResponse(id, vendorResponseDto, user);
    }

    @Post(':id/helpful')
    @Roles(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark review as helpful' })
    @ApiResponse({ status: 204, description: 'Review marked as helpful' })
    @ApiResponse({ status: 409, description: 'Already marked as helpful' })
    markAsHelpful(@Param('id', ParseUuidPipe) id: string, @CurrentUser() user: User) {
        return this.reviewsService.markAsHelpful(id, user);
    }

    @Delete(':id/helpful')
    @Roles(UserRole.USER, UserRole.VENDOR, UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove helpful mark from review' })
    @ApiResponse({ status: 204, description: 'Helpful mark removed' })
    removeHelpfulMark(@Param('id', ParseUuidPipe) id: string, @CurrentUser() user: User) {
        return this.reviewsService.removeHelpfulMark(id, user);
    }
}
