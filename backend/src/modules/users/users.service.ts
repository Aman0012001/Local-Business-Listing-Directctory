import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { SavedListing } from '../../entities/favorite.entity';
import { Notification } from '../../entities/notification.entity';
import { Listing } from '../../entities/business.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
    createPaginatedResponse,
    calculateSkip,
} from '../../common/utils/pagination.util';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(SavedListing)
        private savedListingRepository: Repository<SavedListing>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(Listing)
        private businessRepository: Repository<Listing>,
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
        console.log(`[UsersService] Updating profile for user ${id}:`, JSON.stringify(updateUserDto, null, 2));
        const user = await this.getProfile(id);

        Object.assign(user, updateUserDto);
        const savedUser = await this.userRepository.save(user);
        console.log(`[UsersService] Profile saved successfully for user ${id}`);

        // Re-fetch to ensure everything is up to date and relations are populated
        return this.getProfile(id);
    }

    /**
     * Update user avatar
     */
    async updateAvatar(id: string, filename: string): Promise<User> {
        console.log(`[UsersService] Updating avatar for user ${id}`);
        const user = await this.getProfile(id);
        user.avatarUrl = filename;
        await this.userRepository.save(user);

        console.log(`[UsersService] Avatar saved successfully for user ${id}`);
        return this.getProfile(id);
    }

    /**
     * Change user password
     */
    async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'password'],
        });

        if (!user) throw new NotFoundException('User not found');
        if (!user.password) throw new ConflictException('User does not have a password set');

        const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isPasswordValid) throw new ConflictException('Invalid old password');

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);
    }

    /**
     * Add to favorites
     */
    async addFavorite(userId: string, businessId: string): Promise<void> {
        // Check if business exists
        const business = await this.businessRepository.findOne({ where: { id: businessId } });
        if (!business) throw new NotFoundException('Business not found');

        // Check if already favoring
        const existing = await this.savedListingRepository.findOne({ where: { userId, businessId } });
        if (existing) return;

        const savedListing = this.savedListingRepository.create({ userId, businessId });
        await this.savedListingRepository.save(savedListing);
    }

    /**
     * Remove from favorites
     */
    async removeFavorite(userId: string, businessId: string): Promise<void> {
        const savedListing = await this.savedListingRepository.findOne({ where: { userId, businessId } });
        if (!savedListing) throw new NotFoundException('Saved listing not found');

        await this.savedListingRepository.remove(savedListing);
    }

    /**
     * Get user favorites
     */
    async getFavorites(userId: string, page = 1, limit = 20) {
        console.log(`[UsersService] Fetching favorites for userId: ${userId}`);
        const skip = calculateSkip(page, limit);

        const [savedListings, total] = await this.savedListingRepository.findAndCount({
            where: { userId },
            relations: ['business', 'business.category'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return createPaginatedResponse(
            savedListings.map((f) => f.business),
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
