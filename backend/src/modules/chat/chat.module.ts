import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatConversation, ChatMessage, User, Listing, Vendor } from '../../entities';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WsJwtGuard } from '../notifications/ws-jwt.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatConversation, ChatMessage, User, Listing, Vendor]),
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_EXPIRATION') as any,
                },
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        forwardRef(() => import('../leads/leads.module').then(m => m.LeadsModule)),
    ],
    providers: [ChatService, ChatGateway, WsJwtGuard],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule {}
