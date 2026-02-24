import { DomainError } from '../../../../core/errors/DomainError';

export class InvalidTokenError extends DomainError {
    constructor(details?: Record<string, any>) {
        super({
            message: 'Invalid or expired token',
            code: 'AUTH_INVALID_TOKEN',
            statusCode: 401,
            details,
        });
    }
}

export class AccessDeniedError extends DomainError {
    constructor(details?: Record<string, any>) {
        super({
            message: 'Access Denied',
            code: 'AUTH_ACCESS_DENIED',
            statusCode: 403,
            details,
        });
    }
}
