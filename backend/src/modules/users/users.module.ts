import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { User } from '../../entities/user.entity';
import { SavedListing } from '../../entities/favorite.entity';
import { Notification } from '../../entities/notification.entity';
import { Listing } from '../../entities/business.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, SavedListing, Notification, Listing]),
        SubscriptionsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
