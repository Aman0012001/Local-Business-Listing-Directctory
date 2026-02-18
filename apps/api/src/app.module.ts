import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { AuthModule } from './modules/auth/auth.module';
<<<<<<< HEAD
import { CitiesModule } from './modules/cities/cities.module';
=======
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
<<<<<<< HEAD
        password: configService.get<string>('DB_PASSWORD', ''),
=======
        password: configService.get<string>('DB_PASSWORD', '5432'),
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
        database: configService.get<string>('DB_DATABASE', 'business_saas_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Changed to false - using manual migrations
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CategoriesModule,
    BusinessesModule,
    AuthModule,
<<<<<<< HEAD
    CitiesModule,
=======
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule { }
