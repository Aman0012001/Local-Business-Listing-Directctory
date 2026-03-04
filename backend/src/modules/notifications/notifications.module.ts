import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { WsJwtGuard } from './ws-jwt.guard';
import { Notification } from '../../entities/notification.entity';
import { User } from '../../entities/user.entity';

@Global()
@Module({
    imports: [JwtModule, TypeOrmModule.forFeature([Notification, User])],
    providers: [NotificationsGateway, NotificationsService, WsJwtGuard],
    controllers: [NotificationsController],
    exports: [NotificationsGateway, NotificationsService],
})
export class NotificationsModule { }
