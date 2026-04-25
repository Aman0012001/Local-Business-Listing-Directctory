import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private readonly dataSource: DataSource, // ✅ USE THIS
    ) { }

    @Get()
    @Public()
    async check() {
        let dbStatus = 'ok';

        try {
            await this.dataSource.query('SELECT 1'); // ✅ WORKS ALWAYS
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