import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {

    @Public() // ✅ THIS FIX
    @Get()
    check() {
        return {
            status: 'ok',
        };
    }
}