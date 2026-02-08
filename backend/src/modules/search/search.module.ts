import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Business } from '../../entities/business.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Business]),
        ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                node: configService.get<string>('ELASTICSEARCH_NODE') || 'http://localhost:9200',
                auth: {
                    username: configService.get<string>('ELASTICSEARCH_USERNAME') || 'elastic',
                    password: configService.get<string>('ELASTICSEARCH_PASSWORD') || '',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [SearchController],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule { }
