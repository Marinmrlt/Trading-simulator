import { DomainError } from '../../../../core/errors/DomainError';

export class UserNotFoundError extends DomainError {
    constructor(id: string, details?: Record<string, any>) {
        super({
            message: `User with id ${id} not found`,
            code: 'USER_NOT_FOUND',
            statusCode: 404,
            details: { ...details, id },
        });
    }
}

export class UserUpdateError extends DomainError {
    constructor(message: string, details?: Record<string, any>) {
        super({
            message,
            code: 'USER_UPDATE_ERROR',
            statusCode: 500,
            details,
        });
    }
}
