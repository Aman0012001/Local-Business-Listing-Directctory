import {
    Controller,
    Post,
    Delete,
    Get,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
    constructor(private readonly followsService: FollowsService) {}

    @Post(':businessId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Follow a business' })
    follow(@Param('businessId') businessId: string, @CurrentUser() user: User) {
        return this.followsService.follow(user.id, businessId);
    }

    @Delete(':businessId')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unfollow a business' })
    unfollow(@Param('businessId') businessId: string, @CurrentUser() user: User) {
        return this.followsService.unfollow(user.id, businessId);
    }

    @Get('my')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all businesses followed by current user' })
    getMyFollows(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.followsService.getMyFollows(user.id, page, limit);
    }

    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    @Get(':businessId/count')
    @ApiOperation({ summary: 'Get follower count for a business' })
    getFollowerCount(@Param('businessId') businessId: string) {
        return this.followsService.getFollowerCount(businessId);
    }

    @Get(':businessId/check')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if current user follows a business' })
    checkFollow(@Param('businessId') businessId: string, @CurrentUser() user: User) {
        return this.followsService.checkFollow(user.id, businessId);
    }
}
