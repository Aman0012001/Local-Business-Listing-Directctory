import { Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { BroadcastService } from '../notifications/broadcast.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
    constructor(
        private readonly searchService: SearchService,
        private readonly broadcastService: BroadcastService
    ) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Search businesses using Elasticsearch' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    async search(
        @Query('q') query: string,
        @Query('city') city?: string,
        @Query('category') category?: string,
        @Req() req?: any
    ) {
        // Trigger broadcast notification (async, don't await to keep search fast)
        this.broadcastService.handleSearch(query, req?.user?.id, city).catch(err => {
            console.error('Broadcast handleSearch error:', err);
        });

        return this.searchService.search(query, city, category);
    }

    @Post('sync')
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Re-index all businesses (Admin only)' })
    @ApiResponse({ status: 201, description: 'Sync completed' })
    async sync() {
        return this.searchService.reindexAll();
    }
}
