import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errors: any[] | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || exception.message;
                errors = responseObj.errors;
            } else {
                message = exceptionResponse;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Log the error
        this.logger.error(
            `[${request.method}] ${request.url} - Status: ${status} - Message: ${Array.isArray(message) ? message.join(', ') : message
            }`,
            exception instanceof Error ? exception.stack : undefined,
        );

        // Send response
        const errorResponse: any = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (errors) {
            errorResponse.errors = errors;
        }

        response.status(status).json(errorResponse);
    }
}
