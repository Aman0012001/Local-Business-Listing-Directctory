import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;
        const now = Date.now();

        const userId = user?.id || 'anonymous';
        const userRole = user?.role || 'guest';

        this.logger.log(
            `[${method}] ${url} - User: ${userId} (${userRole}) - Request started`,
        );

        return next.handle().pipe(
            tap({
                next: () => {
                    const responseTime = Date.now() - now;
                    this.logger.log(
                        `[${method}] ${url} - User: ${userId} - Completed in ${responseTime}ms`,
                    );
                },
                error: (error) => {
                    const responseTime = Date.now() - now;
                    this.logger.error(
                        `[${method}] ${url} - User: ${userId} - Failed in ${responseTime}ms - Error: ${error.message}`,
                    );
                },
            }),
        );
    }
}
