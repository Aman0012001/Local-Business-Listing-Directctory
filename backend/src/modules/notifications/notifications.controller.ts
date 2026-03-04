import { Controller, Get, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    findAll(@Request() req: any) {
        return this.notificationsService.findAllForUser(req.user.id);
    }

    @Patch(':id/read')
    markRead(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.markRead(id, req.user.id);
    }

    @Patch('read-all')
    markAllRead(@Request() req: any) {
        return this.notificationsService.markAllRead(req.user.id);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.delete(id, req.user.id);
    }
}
