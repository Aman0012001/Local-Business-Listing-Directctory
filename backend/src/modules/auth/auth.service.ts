import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtTokens } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Register a new user
     */
    async register(registerDto: RegisterDto): Promise<{ user: User; tokens: JwtTokens }> {
        const { email, password, fullName, phone } = registerDto;

        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in database
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            fullName,
            phone,
            role: UserRole.USER,
            isEmailVerified: true, // Auto-verify for local auth
            isActive: true,
        });

        const savedUser = await this.userRepository.save(user);

        // Generate tokens
        const tokens = await this.generateTokens(savedUser);

        // Remove sensitive data
        delete savedUser.password;

        return { user: savedUser, tokens };
    }

    /**
     * Login with email and password
     */
    async login(loginDto: LoginDto): Promise<{ user: User; tokens: JwtTokens }> {
        const { email, password } = loginDto;

        // Find user in database with password
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.vendor', 'vendor')
            .where('user.email = :email AND user.isActive = :isActive', { email, isActive: true })
            .getOne();

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        if (!user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);

        // Generate tokens
        const tokens = await this.generateTokens(user);

        // Remove sensitive data
        delete user.password;

        return { user, tokens };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<JwtTokens> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            const user = await this.userRepository.findOne({
                where: { id: payload.sub, isActive: true },
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return this.generateTokens(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    /**
     * Generate JWT tokens
     */
    private async generateTokens(user: User): Promise<JwtTokens> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload as any, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION') as any,
            }),
            this.jwtService.signAsync(payload as any, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') as any,
            }),
        ]);

        return { accessToken, refreshToken };
    }

    /**
     * Validate user by ID
     */
    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id: userId, isActive: true },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}
