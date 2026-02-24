import { IStrategy, StrategySignal } from './strategy.interface';
import type { Candle } from '../../../market/domain/ports/market-data-provider.port';
import { SMA } from 'technicalindicators';

export class SmaCrossStrategy implements IStrategy {
    name = 'SMA_CROSS';
    description = 'Simple Moving Average Crossover Strategy';

    private smaShort: number[] = [];
    private smaLong: number[] = [];
    private params: { shortPeriod: number; longPeriod: number };

    validateParameters(params: any) {
        if (!params || !params.shortPeriod || !params.longPeriod) {
            throw new Error('SMA Cross requires shortPeriod and longPeriod parameters');
        }
        if (params.shortPeriod >= params.longPeriod) {
            throw new Error('shortPeriod must be strictly less than longPeriod');
        }
    }

    prepare(candles: Candle[], params: any) {
        this.params = params;
        const closePrices = candles.map(c => c.close);

        this.smaShort = SMA.calculate({ period: this.params.shortPeriod, values: closePrices });
        this.smaLong = SMA.calculate({ period: this.params.longPeriod, values: closePrices });
    }

    onCandle(index: number, candle: Candle, position: number, balance: number): StrategySignal {
        const { shortPeriod, longPeriod } = this.params;

        // Alignment: TI arrays are shorter. 
        // smaShort[0] corresponds to closePrices[shortPeriod - 1]
        // We need index i corresponding to smaShort[i - shortPeriod]

        const shortVal = this.smaShort[index - shortPeriod + 1];
        const longVal = this.smaLong[index - longPeriod + 1];
        const prevShort = this.smaShort[index - shortPeriod];
        const prevLong = this.smaLong[index - longPeriod];

        if (!shortVal || !longVal || !prevShort || !prevLong) {
            return { action: 'HOLD' };
        }

        // Buy: Short Crosses Above Long
        if (prevShort <= prevLong && shortVal > longVal) {
            return { action: 'BUY' };
        }

        // Sell: Short Crosses Below Long
        if (prevShort >= prevLong && shortVal < longVal) {
            return { action: 'SELL' };
        }

        return { action: 'HOLD' };
    }
}
