import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../../entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: User;
        tokens: import("../../common").JwtTokens;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        tokens: import("../../common").JwtTokens;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<import("../../common").JwtTokens>;
    getProfile(user: User): Promise<{
        user: User;
    }>;
}
