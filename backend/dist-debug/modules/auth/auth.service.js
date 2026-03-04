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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    constructor(userRepository, jwtService, configService, notificationsService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationsService = notificationsService;
    }
    async register(registerDto) {
        const { email, password, fullName, phone } = registerDto;
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            fullName,
            phone,
            role: registerDto.role || user_entity_1.UserRole.USER,
            isEmailVerified: true,
            isActive: true,
        });
        const savedUser = await this.userRepository.save(user);
        const tokens = await this.generateTokens(savedUser);
        delete savedUser.password;
        if (savedUser.role === user_entity_1.UserRole.VENDOR) {
            this.notificationsService.broadcast({
                title: '🏪 New Vendor Joined!',
                message: `${savedUser.fullName || savedUser.email} just joined as a vendor. Check out their upcoming listings!`,
                type: 'new_vendor',
                data: { vendorUserId: savedUser.id },
            }).catch(() => { });
        }
        return { user: savedUser, tokens };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.vendor', 'vendor')
            .where('user.email = :email AND user.isActive = :isActive', { email, isActive: true })
            .getOne();
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        const tokens = await this.generateTokens(user);
        delete user.password;
        return { user, tokens };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub, isActive: true },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRATION'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async validateUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true },
            relations: ['vendor'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map