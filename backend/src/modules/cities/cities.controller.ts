import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('cities')
@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all cities' })
    @ApiResponse({ status: 200, description: 'Return all cities' })
    findAll() {
        return this.citiesService.findAll();
    }

    @Public()
    @Get('popular')
    @ApiOperation({ summary: 'Get popular cities' })
    @ApiResponse({ status: 200, description: 'Return popular cities' })
    findPopular() {
        return this.citiesService.findPopular();
    }

    @Public()
    @Get(':slug')
    @ApiOperation({ summary: 'Get city by slug' })
    @ApiResponse({ status: 200, description: 'Return city details' })
    @ApiResponse({ status: 404, description: 'City not found' })
    findBySlug(@Param('slug') slug: string) {
        return this.citiesService.findBySlug(slug);
    }
}
