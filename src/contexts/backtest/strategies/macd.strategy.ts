import { IStrategy, StrategySignal } from './strategy.interface';
import type { Candle } from '../../market/interfaces/market-data.provider.interface';
import { MACD } from 'technicalindicators';

export class MacdStrategy implements IStrategy {
    name = 'MACD';
    description = 'MACD: Buy when MACD crosses above Signal, Sell when below.';

    private macdValues: any[] = [];
    private offset: number = 0;
    private params: { fastPeriod: number; slowPeriod: number; signalPeriod: number };

    validateParameters(params: any) {
        if (!params) {
            throw new Error('MACD requires parameters');
        }
        if (!params.fastPeriod) params.fastPeriod = 12;
        if (!params.slowPeriod) params.slowPeriod = 26;
        if (!params.signalPeriod) params.signalPeriod = 9;

        if (params.fastPeriod >= params.slowPeriod) {
            throw new Error('Fast period must be lower than Slow period');
        }
    }

    prepare(candles: Candle[], params: any) {
        this.params = {
            fastPeriod: params?.fastPeriod || 12,
            slowPeriod: params?.slowPeriod || 26,
            signalPeriod: params?.signalPeriod || 9
        };

        const closePrices = candles.map(c => c.close);

        // Calculate MACD
        this.macdValues = MACD.calculate({
            values: closePrices,
            fastPeriod: this.params.fastPeriod,
            slowPeriod: this.params.slowPeriod,
            signalPeriod: this.params.signalPeriod,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });

        // Determine offset
        // TI MACD result length is usually input.length - (slow + signal - 2)
        this.offset = closePrices.length - this.macdValues.length;
    }

    onCandle(index: number, candle: Candle, position: number, balance: number): StrategySignal {
        // Calculate index in macdValues array
        const macdIndex = index - this.offset;

        if (macdIndex < 0) return { action: 'HOLD' };

        const current = this.macdValues[macdIndex];
        const prev = this.macdValues[macdIndex - 1];

        if (!current || !prev) return { action: 'HOLD' };

        // Buy: Histogram crosses from Negative to Positive (MACD crosses above Signal)
        // Or just MACD > Signal coming from below.
        // Histogram = MACD - Signal.
        // Buy if Histogram > 0 AND PrevHistogram <= 0.

        if (prev.histogram <= 0 && current.histogram > 0) {
            return { action: 'BUY' };
        }

        // Sell: Histogram crosses from Positive to Negative
        if (prev.histogram >= 0 && current.histogram < 0) {
            return { action: 'SELL' };
        }

        return { action: 'HOLD' };
    }
}
