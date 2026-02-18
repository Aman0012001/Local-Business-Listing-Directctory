import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { Favorite } from '../../entities/favorite.entity';
import { Notification } from '../../entities/notification.entity';
import { Business } from '../../entities/business.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    createPaginatedResponse,
    calculateSkip,
} from '../../common/utils/pagination.util';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Favorite)
        private favoriteRepository: Repository<Favorite>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(Business)
        private businessRepository: Repository<Business>,
    ) { }

    /**
     * Get user profile
     */
    async getProfile(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.getProfile(id);

        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    /**
     * Add to favorites
     */
    async addFavorite(userId: string, businessId: string): Promise<void> {
        // Check if business exists
        const business = await this.businessRepository.findOne({ where: { id: businessId } });
        if (!business) throw new NotFoundException('Business not found');

        // Check if already favoring
        const existing = await this.favoriteRepository.findOne({ where: { userId, businessId } });
        if (existing) return;

        const favorite = this.favoriteRepository.create({ userId, businessId });
        await this.favoriteRepository.save(favorite);
    }

    /**
     * Remove from favorites
     */
    async removeFavorite(userId: string, businessId: string): Promise<void> {
        const favorite = await this.favoriteRepository.findOne({ where: { userId, businessId } });
        if (!favorite) throw new NotFoundException('Favorite not found');

        await this.favoriteRepository.remove(favorite);
    }

    /**
     * Get user favorites
     */
    async getFavorites(userId: string, page = 1, limit = 20) {
        const skip = calculateSkip(page, limit);

        const [favorites, total] = await this.favoriteRepository.findAndCount({
            where: { userId },
            relations: ['business', 'business.category'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return createPaginatedResponse(
            favorites.map((f) => f.business),
            page,
            limit,
            total,
        );
    }

    /**
     * Get user notifications
     */
    async getNotifications(userId: string, page = 1, limit = 20) {
        const skip = calculateSkip(page, limit);

        const [notifications, total] = await this.notificationRepository.findAndCount({
            where: { userId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return createPaginatedResponse(notifications, page, limit, total);
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(userId: string, notificationId: string): Promise<void> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });

        if (!notification) throw new NotFoundException('Notification not found');

        notification.isRead = true;
        notification.readAt = new Date();
        await this.notificationRepository.save(notification);
    }

    /**
     * ADMIN: Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }
}
