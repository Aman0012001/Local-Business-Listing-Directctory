import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { LeadsModule } from './modules/leads/leads.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SearchModule } from './modules/search/search.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CitiesModule } from './modules/cities/cities.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { typeOrmConfig } from './config/typeorm.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthModule } from './modules/health/health.module';
import { OffersModule } from './modules/offers/offers.module';
import { CommentsModule } from './modules/comments/comments.module';
import { DemandModule } from './modules/demand/demand.module';
import { FollowsModule } from './modules/follows/follows.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';
import { JobLeadsModule } from './modules/job-leads/job-leads.module';

import { join } from 'path';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        ScheduleModule.forRoot(),
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const redisEnabled = configService.get('REDIS_ENABLED') === 'true';
                const ttl = configService.get('REDIS_TTL') ? parseInt(configService.get('REDIS_TTL')) * 1000 : 600 * 1000;

                if (!redisEnabled) {
                    return { ttl };
                }

                try {
                    const store = await redisStore({
                        socket: {
                            host: configService.get('REDIS_HOST') || 'localhost',
                            port: parseInt(configService.get('REDIS_PORT')) || 6379,
                        },
                        ttl,
                    });
                    return { store, ttl };
                } catch (error) {
                    console.error('Failed to initialize Redis store, falling back to memory:', error.message);
                    return { ttl };
                }
            },
        }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) =>
                typeOrmConfig(configService),
            inject: [ConfigService],
        }),

        // Rate Limiting
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [
                {
                    ttl: configService.get('THROTTLE_TTL') ? parseInt(configService.get('THROTTLE_TTL')) : 60,
                    limit: configService.get('THROTTLE_LIMIT') ? parseInt(configService.get('THROTTLE_LIMIT')) : 100,
                },
            ],
        }),

        // Feature Modules
        AuthModule,
        UsersModule,
        VendorsModule,
        CategoriesModule,
        BusinessesModule,
        ReviewsModule,
        LeadsModule,
        SubscriptionsModule,
        SearchModule,
        AdminModule,
        NotificationsModule,
        CitiesModule,
        CloudinaryModule,
        HealthModule,
        OffersModule,
        CommentsModule,
        DemandModule,
        FollowsModule,
        AffiliateModule,
        JobLeadsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }

