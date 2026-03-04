"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const vendors_module_1 = require("./modules/vendors/vendors.module");
const categories_module_1 = require("./modules/categories/categories.module");
const businesses_module_1 = require("./modules/businesses/businesses.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const leads_module_1 = require("./modules/leads/leads.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const search_module_1 = require("./modules/search/search.module");
const admin_module_1 = require("./modules/admin/admin.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const cities_module_1 = require("./modules/cities/cities.module");
const cloudinary_module_1 = require("./modules/cloudinary/cloudinary.module");
const typeorm_config_1 = require("./config/typeorm.config");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const health_module_1 = require("./modules/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => (0, typeorm_config_1.typeOrmConfig)(configService),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => [
                    {
                        ttl: configService.get('THROTTLE_TTL') ? parseInt(configService.get('THROTTLE_TTL')) : 60,
                        limit: configService.get('THROTTLE_LIMIT') ? parseInt(configService.get('THROTTLE_LIMIT')) : 100,
                    },
                ],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            vendors_module_1.VendorsModule,
            categories_module_1.CategoriesModule,
            businesses_module_1.BusinessesModule,
            reviews_module_1.ReviewsModule,
            leads_module_1.LeadsModule,
            subscriptions_module_1.SubscriptionsModule,
            search_module_1.SearchModule,
            admin_module_1.AdminModule,
            notifications_module_1.NotificationsModule,
            cities_module_1.CitiesModule,
            cloudinary_module_1.CloudinaryModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map