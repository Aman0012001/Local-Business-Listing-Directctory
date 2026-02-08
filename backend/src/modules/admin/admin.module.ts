import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { Business } from '../../entities/business.entity';
import { Review } from '../../entities/review.entity';
import { Vendor } from '../../entities/vendor.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Business,
            Review,
            Vendor,
            Transaction,
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
