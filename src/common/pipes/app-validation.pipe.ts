import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';

export function buildGlobalValidationPipe(): ValidationPipe {
    return new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
            const fields: Record<string, string[]> = {};

            errors.forEach(err => {
                if (err.constraints) {
                    fields[err.property] = Object.values(err.constraints);
                }
            });

            return new BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                fields,
            });
        },
    });
}
