import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DemandService } from './demand.service';

@Injectable()
export class DemandTasks {
    private readonly logger = new Logger(DemandTasks.name);

    constructor(private readonly demandService: DemandService) { }

    @Cron('*/15 * * * *')
    async handleDemandAnalysis() {
        this.logger.debug('Triggering background demand analysis task...');
        try {
            await this.demandService.processDemandAlerts();
        } catch (error) {
            this.logger.error(`[Cron] Error in demand analysis task: ${error.message}`);
        }
    }
}
