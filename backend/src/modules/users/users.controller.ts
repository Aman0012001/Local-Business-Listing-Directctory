import {
    Controller,
    Get,
    Patch,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { User } from '../../entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
    getProfile(@CurrentUser() user: User) {
        return this.usersService.getProfile(user.id);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update current user profile' })
    @ApiResponse({ status: 200, description: 'Profile updated successfully' })
    updateProfile(@CurrentUser() user: User, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateProfile(user.id, updateUserDto);
    }

    @Get('favorites')
    @ApiOperation({ summary: 'Get current user favorite businesses' })
    @ApiResponse({ status: 200, description: 'Favorites retrieved successfully' })
    getFavorites(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.usersService.getFavorites(user.id, page, limit);
    }

    @Post('favorites/:businessId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Add business to favorites' })
    @ApiResponse({ status: 204, description: 'Added to favorites' })
    addFavorite(
        @CurrentUser() user: User,
        @Param('businessId', ParseUuidPipe) businessId: string,
    ) {
        return this.usersService.addFavorite(user.id, businessId);
    }

    @Delete('favorites/:businessId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove business from favorites' })
    @ApiResponse({ status: 204, description: 'Removed from favorites' })
    removeFavorite(
        @CurrentUser() user: User,
        @Param('businessId', ParseUuidPipe) businessId: string,
    ) {
        return this.usersService.removeFavorite(user.id, businessId);
    }

    @Get('notifications')
    @ApiOperation({ summary: 'Get current user notifications' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
    getNotifications(
        @CurrentUser() user: User,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.usersService.getNotifications(user.id, page, limit);
    }

    @Patch('notifications/:id/read')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({ status: 204, description: 'Notification marked as read' })
    markNotificationRead(
        @CurrentUser() user: User,
        @Param('id', ParseUuidPipe) id: string,
    ) {
        return this.usersService.markNotificationRead(user.id, id);
    }
}
