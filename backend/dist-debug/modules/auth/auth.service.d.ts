import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtTokens } from '../../common/interfaces/jwt-payload.interface';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private notificationsService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, notificationsService: NotificationsService);
    register(registerDto: RegisterDto): Promise<{
        user: User;
        tokens: JwtTokens;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        tokens: JwtTokens;
    }>;
    refreshToken(refreshToken: string): Promise<JwtTokens>;
    private generateTokens;
    validateUser(userId: string): Promise<User>;
}
