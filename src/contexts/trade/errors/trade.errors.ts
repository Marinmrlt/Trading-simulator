import { DomainError } from '../../error/DomainError';

export class InvalidOrderError extends DomainError {
    constructor(reason: string, details?: Record<string, any>) {
        super({
            message: `Invalid order: ${reason}`,
            code: 'TRADE_INVALID_ORDER',
            statusCode: 400,
            details: { ...details, reason },
        });
    }
}

export class TradeExecutionError extends DomainError {
    constructor(message: string, details?: Record<string, any>) {
        super({
            message: `Trade execution failed: ${message}`,
            code: 'TRADE_EXECUTION_FAILED',
            statusCode: 500,
            details: { ...details, originalError: message },
        });
    }
}

export class OrderNotFoundError extends DomainError {
    constructor(orderId: string) {
        super({
            message: `Order ${orderId} not found`,
            code: 'TRADE_ORDER_NOT_FOUND',
            statusCode: 404,
        });
    }
}

export class OrderNotCancellableError extends DomainError {
    constructor(orderId: string, currentStatus: string) {
        super({
            message: `Order ${orderId} cannot be cancelled (status: ${currentStatus})`,
            code: 'TRADE_ORDER_NOT_CANCELLABLE',
            statusCode: 400,
            details: { orderId, currentStatus },
        });
    }
}

