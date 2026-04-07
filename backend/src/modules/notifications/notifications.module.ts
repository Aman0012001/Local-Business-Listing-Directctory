import { Module, Global, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { WsJwtGuard } from './ws-jwt.guard';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';
import { SearchLog } from '../../entities/search-log.entity';
import { NotificationLog } from '../../entities/notification-log.entity';
import { Category } from '../../entities/category.entity';
import { Listing } from '../../entities/business.entity';
import { BroadcastService } from './broadcast.service';
import { PushService } from './push.service';

@Global()
@Module({
    imports: [
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
        TypeOrmModule.forFeature([Notification, User, SearchLog, NotificationLog, Category, Listing])
    ],
    providers: [NotificationsGateway, NotificationsService, WsJwtGuard, BroadcastService, PushService],
    controllers: [NotificationsController],
    exports: [NotificationsGateway, NotificationsService, BroadcastService, PushService],
})
export class NotificationsModule { }
