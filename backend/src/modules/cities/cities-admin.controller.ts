import { Controller, Get, Post, Body, Query, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../entities/user.entity';

@ApiTags('cities-admin')
@Controller('cities/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@ApiBearerAuth()
export class CitiesAdminController {
    constructor(private readonly citiesService: CitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create/Import city (Admin only)' })
    create(@Body() data: any) {
        return this.citiesService.create(data);
    }

    @Get()
    @ApiOperation({ summary: 'List all cities with pagination (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.citiesService.findAllAdmin(Number(page || 1), Number(limit || 10), search);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete city (Admin only)' })
    remove(@Param('id') id: string) {
        return this.citiesService.remove(id);
    }
}
