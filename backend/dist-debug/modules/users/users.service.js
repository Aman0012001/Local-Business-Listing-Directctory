"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const favorite_entity_1 = require("../../entities/favorite.entity");
const notification_entity_1 = require("../../entities/notification.entity");
const business_entity_1 = require("../../entities/business.entity");
const pagination_util_1 = require("../../common/utils/pagination.util");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userRepository, savedListingRepository, notificationRepository, businessRepository) {
        this.userRepository = userRepository;
        this.savedListingRepository = savedListingRepository;
        this.notificationRepository = notificationRepository;
        this.businessRepository = businessRepository;
    }
    async getProfile(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['vendor'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(id, updateUserDto) {
        console.log(`[UsersService] Updating profile for user ${id}:`, JSON.stringify(updateUserDto, null, 2));
        const user = await this.getProfile(id);
        Object.assign(user, updateUserDto);
        const savedUser = await this.userRepository.save(user);
        console.log(`[UsersService] Profile saved successfully for user ${id}`);
        return this.getProfile(id);
    }
    async updateAvatar(id, filename) {
        console.log(`[UsersService] Updating avatar for user ${id}`);
        const user = await this.getProfile(id);
        user.avatarUrl = filename;
        await this.userRepository.save(user);
        console.log(`[UsersService] Avatar saved successfully for user ${id}`);
        return this.getProfile(id);
    }
    async changePassword(id, dto) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: ['id', 'password'],
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.password)
            throw new common_1.ConflictException('User does not have a password set');
        const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isPasswordValid)
            throw new common_1.ConflictException('Invalid old password');
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);
    }
    async addFavorite(userId, businessId) {
        const business = await this.businessRepository.findOne({ where: { id: businessId } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        const existing = await this.savedListingRepository.findOne({ where: { userId, businessId } });
        if (existing)
            return;
        const savedListing = this.savedListingRepository.create({ userId, businessId });
        await this.savedListingRepository.save(savedListing);
    }
    async removeFavorite(userId, businessId) {
        const savedListing = await this.savedListingRepository.findOne({ where: { userId, businessId } });
        if (!savedListing)
            throw new common_1.NotFoundException('Saved listing not found');
        await this.savedListingRepository.remove(savedListing);
    }
    async getFavorites(userId, page = 1, limit = 20) {
        console.log(`[UsersService] Fetching favorites for userId: ${userId}`);
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const [savedListings, total] = await this.savedListingRepository.findAndCount({
            where: { userId },
            relations: ['business', 'business.category'],
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return (0, pagination_util_1.createPaginatedResponse)(savedListings.map((f) => f.business), page, limit, total);
    }
    async getNotifications(userId, page = 1, limit = 20) {
        const skip = (0, pagination_util_1.calculateSkip)(page, limit);
        const [notifications, total] = await this.notificationRepository.findAndCount({
            where: { userId },
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return (0, pagination_util_1.createPaginatedResponse)(notifications, page, limit, total);
    }
    async markNotificationRead(userId, notificationId) {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        notification.isRead = true;
        notification.readAt = new Date();
        await this.notificationRepository.save(notification);
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(favorite_entity_1.SavedListing)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(3, (0, typeorm_1.InjectRepository)(business_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map