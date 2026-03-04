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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../entities/notification.entity");
const notifications_gateway_1 = require("./notifications.gateway");
const user_entity_1 = require("../../entities/user.entity");
let NotificationsService = class NotificationsService {
    constructor(notificationRepo, userRepo, gateway) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
        this.gateway = gateway;
    }
    async create(dto) {
        const notification = this.notificationRepo.create({
            userId: dto.userId,
            title: dto.title,
            message: dto.message,
            type: dto.type || 'info',
            data: dto.data || {},
        });
        const saved = await this.notificationRepo.save(notification);
        this.gateway.sendToUser(dto.userId, 'notification', {
            id: saved.id,
            title: saved.title,
            message: saved.message,
            type: saved.type,
            data: saved.data,
            isRead: false,
            createdAt: saved.createdAt,
        });
        return saved;
    }
    async broadcast(dto) {
        const users = await this.userRepo.find({
            select: ['id'],
            where: { role: 'user' },
        });
        for (const user of users) {
            await this.create({ ...dto, userId: user.id });
        }
    }
    async findAllForUser(userId) {
        const [notifications, total] = await this.notificationRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        const unreadCount = notifications.filter(n => !n.isRead).length;
        return { notifications, total, unreadCount };
    }
    async markRead(id, userId) {
        await this.notificationRepo.update({ id, userId }, { isRead: true, readAt: new Date() });
    }
    async markAllRead(userId) {
        await this.notificationRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    }
    async delete(id, userId) {
        await this.notificationRepo.delete({ id, userId });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map