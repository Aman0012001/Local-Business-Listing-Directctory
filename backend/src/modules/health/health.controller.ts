import { Controller, Get } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    @Get()
    @Public()
    async check() {
        let dbStatus = 'ok';
        try {
            await this.entityManager.query('SELECT 1');
        } catch (error) {
            dbStatus = `error: ${error.message}`;
        }

        return {
            status: dbStatus === 'ok' ? 'ok' : 'degraded',
            database: dbStatus,
            timestamp: new Date().toISOString(),
        };
    }
}
