export interface Candle {
    symbol: string;
    timeframe: string;
    timestamp: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Ticker {
    symbol: string;
    price: number;
    change24h: number;
}

export interface IMarketDataProvider {
    getTicker(symbol: string): Promise<Ticker>;
    getAllTickers(): Promise<Ticker[]>;
    getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]>;
}
