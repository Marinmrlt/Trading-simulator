import { DomainError } from '../../../../core/errors/DomainError';

export class WalletNotFoundError extends DomainError {
    constructor(userId: string, currency: string, details?: Record<string, any>) {
        super({
            message: `Wallet for user ${userId} with currency ${currency} not found`,
            code: 'WALLET_NOT_FOUND',
            statusCode: 404,
            details: { ...details, userId, currency },
        });
    }
}

export class InsufficientFundsError extends DomainError {
    constructor(details?: Record<string, any>) {
        super({
            message: 'Insufficient funds to perform this operation',
            code: 'WALLET_INSUFFICIENT_FUNDS',
            statusCode: 400,
            details,
        });
    }
}
