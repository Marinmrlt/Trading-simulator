import type { Candle } from '../../../market/domain/ports/market-data-provider.port';

export interface StrategySignal {
    action: 'BUY' | 'SELL' | 'HOLD';
    metadata?: any;
}

export interface IStrategy {
    name: string;
    description: string;

    /**
     * Optional validation of parameters before running backtest
     */
    validateParameters?(params: any): void;

    /**
     * Initialize strategy with full history if needed (e.g. pre-calculate indicators)
     */
    prepare(candles: Candle[], params: any): Promise<void> | void;

    /**
     * Decide action for a specific candle index
     */
    onCandle(index: number, candle: Candle, position: number, balance: number): StrategySignal;
}
