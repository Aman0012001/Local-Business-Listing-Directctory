import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Listing } from '../../entities/business.entity';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { City } from '../../entities/city.entity';

@ApiTags('Admin Search')
@Controller('admin/search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@ApiBearerAuth()
export class AdminSearchController {
    constructor(
        @InjectRepository(Listing)
        private businessRepo: Repository<Listing>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>,
        @InjectRepository(City)
        private cityRepo: Repository<City>,
    ) {}

    @Get('global')
    @ApiOperation({ summary: 'Global search across all main entities for admin' })
    @ApiQuery({ name: 'q', required: true })
    async globalSearch(@Query('q') query: string) {
        if (!query || query.length < 2) return { businesses: [], users: [], categories: [], cities: [] };

        const term = `%${query}%`;

        const [businesses, users, categories, cities] = await Promise.all([
            this.businessRepo.find({
                where: { title: ILike(term) },
                take: 5,
                select: ['id', 'title', 'slug', 'city']
            }),
            this.userRepo.find({
                where: [
                    { fullName: ILike(term) },
                    { email: ILike(term) }
                ],
                take: 5,
                select: ['id', 'fullName', 'email', 'role', 'avatarUrl']
            }),
            this.categoryRepo.find({
                where: { name: ILike(term) },
                take: 5,
                select: ['id', 'name', 'slug']
            }),
            this.cityRepo.find({
                where: { name: ILike(term) },
                take: 5,
                select: ['id', 'name', 'slug']
            })
        ]);

        return {
            businesses,
            users,
            categories,
            cities
        };
    }
}
