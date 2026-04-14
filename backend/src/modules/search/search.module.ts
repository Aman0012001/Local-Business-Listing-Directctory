import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Listing } from '../../entities/business.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { DemandModule } from '../demand/demand.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Listing]),
        NotificationsModule,
        DemandModule,
        ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const apiKey = configService.get<string>('ELASTICSEARCH_API_KEY');
                const node = configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200';
                
                const auth: any = apiKey 
                    ? { apiKey } 
                    : {
                        username: configService.get<string>('ELASTICSEARCH_USERNAME') || 'elastic',
                        password: configService.get<string>('ELASTICSEARCH_PASSWORD') || '',
                    };

                return {
                    node,
                    auth,
                    tls: {
                        rejectUnauthorized: configService.get<string>('ELASTICSEARCH_REJECT_UNAUTHORIZED') !== 'false',
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
