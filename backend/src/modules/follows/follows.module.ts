import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
import { Follow } from '../../entities/follow.entity';
import { Listing } from '../../entities/business.entity';

import { SearchModule } from '../search/search.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Follow, Listing]),
        SearchModule,
    ],
    controllers: [FollowsController],
    providers: [FollowsService],
    exports: [FollowsService],
})
export class FollowsModule {}
