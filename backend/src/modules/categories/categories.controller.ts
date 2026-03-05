import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';
import { UserRole } from '../../entities/user.entity';
import { CategoryStatus } from '../../entities/category.entity';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // --- Admin Endpoints ---

    @Post('admin')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new category (Admin only)' })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    @ApiResponse({ status: 409, description: 'Category already exists' })
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get('admin')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all categories for admin (all statuses)' })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    findAllAdmin() {
        return this.categoriesService.findAllAdmin();
    }

    @Patch('admin/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update category (Admin only)' })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    update(
        @Param('id', ParseUuidPipe) id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Patch('admin/:id/status')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update category status (Admin only)' })
    @ApiResponse({ status: 200, description: 'Category status updated successfully' })
    updateStatus(
        @Param('id', ParseUuidPipe) id: string,
        @Body('status') status: CategoryStatus,
    ) {
        return this.categoriesService.updateStatus(id, status);
    }

    @Delete('admin/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete category (Admin only)' })
    @ApiResponse({ status: 204, description: 'Category deleted successfully' })
    @ApiResponse({ status: 400, description: 'Cannot delete category with subcategories or businesses' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    remove(@Param('id', ParseUuidPipe) id: string) {
        return this.categoriesService.remove(id);
    }

    // --- Public Endpoints ---

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all active categories' })
    @ApiQuery({ name: 'includeSubcategories', required: false, type: Boolean })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    findAll(@Query('includeSubcategories') includeSubcategories?: boolean) {
        return this.categoriesService.findAllActive(includeSubcategories);
    }

    @Public()
    @Get('tree')
    @ApiOperation({ summary: 'Get category tree (hierarchical structure - active only)' })
    @ApiResponse({ status: 200, description: 'Category tree retrieved successfully' })
    getCategoryTree() {
        return this.categoriesService.getCategoryTree(true);
    }

    @Public()
    @Get('root')
    @ApiOperation({ summary: 'Get root categories (no parent - active only)' })
    @ApiResponse({ status: 200, description: 'Root categories retrieved successfully' })
    findRootCategories() {
        return this.categoriesService.findRootCategories(true);
    }

    @Public()
    @Get('popular')
    @ApiOperation({ summary: 'Get popular categories by business count (active only)' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Popular categories retrieved successfully' })
    getPopularCategories(@Query('limit') limit?: number) {
        return this.categoriesService.getPopularCategories(limit);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get active category by slug' })
    @ApiResponse({ status: 200, description: 'Category found' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    findBySlug(@Param('slug') slug: string) {
        return this.categoriesService.findBySlug(slug);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID' })
    @ApiResponse({ status: 200, description: 'Category found' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    findOne(@Param('id', ParseUuidPipe) id: string) {
        return this.categoriesService.findOne(id);
    }
}
