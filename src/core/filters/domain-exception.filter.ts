import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../errors/DomainError';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let body: any = {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal Server Error',
        };

        if (exception instanceof DomainError) {
            statusCode = exception.statusCode;
            body = {
                code: exception.code,
                message: exception.message,
                fields: exception.fields,
                details: exception.details,
            };
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const responseBody = exception.getResponse();

            if (typeof responseBody === 'object' && responseBody !== null) {
                const resObj = responseBody as any;
                body = {
                    code: resObj.code || 'HTTP_ERROR', // ValidationPipe sends 'code'
                    message: resObj.message || exception.message,
                    fields: resObj.fields,
                    details: resObj.details,
                };
            } else {
                body = {
                    code: 'HTTP_ERROR',
                    message: exception.message,
                };
            }
        } else {
            this.logger.error(exception);
        }

        response.status(statusCode).json(body);
    }
}
