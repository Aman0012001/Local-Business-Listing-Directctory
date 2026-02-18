<<<<<<< HEAD
import { Controller, Get, Param, Query } from '@nestjs/common';
=======
import { Controller, Get, Param } from '@nestjs/common';
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
import { CategoriesService } from './categories.service';
import { Category } from '../../entities/category.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(): Promise<Category[]> {
        return this.categoriesService.findAll();
    }

<<<<<<< HEAD
    @Get('popular')
    async getPopular(@Query('limit') limit: number = 8): Promise<Category[]> {
        return this.categoriesService.getPopular(limit);
    }

    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string): Promise<Category | null> {
        return this.categoriesService.findBySlug(slug);
    }

=======
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Category | null> {
        return this.categoriesService.findOne(id);
    }
}
