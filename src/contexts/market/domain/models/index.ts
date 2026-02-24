// Pure domain model interfaces — NO framework imports

export interface IAsset {
    symbol: string;
    name: string;
    currentPrice: number;
    lastUpdate: Date;
}

export interface ICandle {
    id: string;
    symbol: string;
    interval: string;
    openTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface IAlert {
    id: string;
    userId: string;
    symbol: string;
    condition: 'ABOVE' | 'BELOW';
    targetPrice: number;
    triggered: boolean;
    createdAt: Date;
}
