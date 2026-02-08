import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '../../entities/category.entity';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll(): Promise<Category[]> {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Category | null> {
        return this.categoriesService.findOne(id);
    }
}
