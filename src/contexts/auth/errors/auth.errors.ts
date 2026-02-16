import { DomainError } from '../../error/DomainError';

export class InvalidCredentialsError extends DomainError {
    constructor(details?: Record<string, any>) {
        super({
            message: 'Invalid credentials',
            code: 'AUTH_INVALID_CREDENTIALS',
            statusCode: 401,
            details,
        });
    }
}

export class UserNotFoundError extends DomainError {
    constructor(details?: Record<string, any>) {
        super({
            message: 'User not found',
            code: 'AUTH_USER_NOT_FOUND',
            statusCode: 404,
            details,
        });
    }
}

export class UserAlreadyExistsError extends DomainError {
    constructor(email: string, details?: Record<string, any>) {
        super({
            message: `User with email ${email} already exists`,
            code: 'AUTH_USER_ALREADY_EXISTS',
            statusCode: 409,
            details: { ...details, email },
        });
    }
}


