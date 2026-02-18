import { Controller, Get, Param, Query } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { Business } from '../../entities/business.entity';

@Controller('businesses')
export class BusinessesController {
    constructor(private readonly businessesService: BusinessesService) { }

    @Get('search')
<<<<<<< HEAD
    async search(@Query() params: any): Promise<any> {
=======
    async search(@Query() params: any): Promise<Business[]> {
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
        return this.businessesService.search(params);
    }

    @Get()
<<<<<<< HEAD
    async findAll(@Query() query: any): Promise<any> {
        return this.businessesService.findAll(query);
    }

    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string): Promise<Business | null> {
        return this.businessesService.findBySlug(slug);
    }

=======
    async findAll(@Query() query: any): Promise<Business[]> {
        return this.businessesService.findAll(query);
    }

>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Business | null> {
        return this.businessesService.findOne(id);
    }
}
