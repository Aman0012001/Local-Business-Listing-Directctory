import { Controller, Get, Param, Query } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business } from '../../entities/business.entity';

@Controller('businesses')
export class BusinessesController {
    constructor(private readonly businessesService: BusinessesService) { }

    @Get('search')
    async search(@Query() params: any): Promise<Business[]> {
        return this.businessesService.search(params);
    }

    @Get()
    async findAll(@Query() query: any): Promise<Business[]> {
        return this.businessesService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Business | null> {
        return this.businessesService.findOne(id);
    }
}
