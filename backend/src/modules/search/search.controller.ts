import { Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { BroadcastService } from '../notifications/broadcast.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';
import { SearchBusinessDto } from '../businesses/dto/search-business.dto';

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
    @ApiOperation({ summary: 'Search businesses using Elasticsearch or Database fallback' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    async search(
        @Query() searchDto: SearchBusinessDto,
        @Req() req?: any
    ) {
        // Trigger broadcast notification (async, don't await to keep search fast)
        this.broadcastService.handleSearch(
            searchDto.query || '', 
            req?.user?.id, 
            searchDto.city
        ).catch(err => {
            console.error('Broadcast handleSearch error:', err);
        });

        return this.searchService.search(searchDto);
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
