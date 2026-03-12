import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { Listing } from '../../entities/business.entity';
import { Review } from '../../entities/review.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Transaction } from '../../entities/transaction.entity';

import { SystemSetting } from '../../entities/system-setting.entity';
import { BusinessHours } from '../../entities/business-hours.entity';
import { BusinessAmenity } from '../../entities/business-amenity.entity';
import { Lead } from '../../entities/lead.entity';
import { SavedListing } from '../../entities/favorite.entity';
import { Comment } from '../../entities/comment.entity';
import { Notification } from '../../entities/notification.entity';
import { Subscription } from '../../entities/subscription.entity';
import { CommentReply } from '../../entities/comment-reply.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Listing,
            Review,
            Vendor,
            Transaction,
            SystemSetting,
            BusinessHours,
            BusinessAmenity,
            Lead,
            SavedListing,
            Comment,
            Notification,
            Subscription,
            CommentReply,
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
