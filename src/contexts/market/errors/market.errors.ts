import { DomainError } from '../../error/DomainError';

export class AssetNotFoundError extends DomainError {
    constructor(symbol: string, details?: Record<string, any>) {
        super({
            message: `Asset ${symbol} not found`,
            code: 'MARKET_ASSET_NOT_FOUND',
            statusCode: 404,
            details: { ...details, symbol },
        });
    }
}

export class MarketDataUnavailableError extends DomainError {
    constructor(details?: Record<string, any>) {
        super({
            message: 'Market data currently unavailable',
            code: 'MARKET_DATA_UNAVAILABLE',
            statusCode: 503,
            details,
        });
    }
}
