import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        try {
            const { sub: userId } = payload;

            const user = await this.userRepository.findOne({
                where: { id: userId, isActive: true },
            });

            if (!user) {
                throw new UnauthorizedException('User not found or inactive');
            }

            return user;
        } catch (error) {
            console.error(`[JwtStrategy] Validation failed for payload ${JSON.stringify(payload)}:`, error.message);
            
            // Handle database connection errors gracefully
            if (error.code === 'ENETUNREACH' || error.code === 'ECONNREFUSED' || error.message.includes('Connection terminated')) {
                const { ServiceUnavailableException } = require('@nestjs/common');
                throw new ServiceUnavailableException('Database is currently unreachable. Please check your internet or database status.');
            }
            
            // If it's not already a 401, it might be a DB query error
            throw error;
        }
    }
}
