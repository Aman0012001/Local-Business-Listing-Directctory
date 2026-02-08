import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { WsJwtGuard } from './ws-jwt.guard';

@Global()
@Module({
    imports: [JwtModule],
    providers: [NotificationsGateway, WsJwtGuard],
    exports: [NotificationsGateway],
})
export class NotificationsModule { }
