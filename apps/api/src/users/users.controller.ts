import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { Req, UseGuards } from '@nestjs/common';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any): Promise<User | null> {
        return this.usersService.findOne(req.user.id);
    }

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User | null> {
        return this.usersService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() userData: Partial<User>): Promise<User> {
        return this.usersService.create(userData);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() userData: Partial<User>,
    ): Promise<User | null> {
        return this.usersService.update(id, userData);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        return this.usersService.remove(id);
    }
}
