import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { DemandTasks } from './demand.tasks';
import { SearchLog, NotificationLog, Listing, City } from '../../entities';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SearchLog, NotificationLog, Listing, City]),
        NotificationsModule
    ],
    controllers: [DemandController],
    providers: [DemandService, DemandTasks],
    exports: [DemandService]
})
export class DemandModule { }
