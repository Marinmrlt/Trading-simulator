import { IStrategy, StrategySignal } from './strategy.interface';
import type { Candle } from '../../market/interfaces/market-data.provider.interface';
import { RSI } from 'technicalindicators';

export class RsiStrategy implements IStrategy {
    name = 'RSI';
    description = 'Relative Strength Index Strategy';

    private rsiValues: number[] = [];
    private params: { period: number; overbought: number; oversold: number };

    validateParameters(params: any) {
        if (!params) {
            throw new Error('RSI requires parameters');
        }
        if (!params.period) params.period = 14;
        if (!params.overbought) params.overbought = 70;
        if (!params.oversold) params.oversold = 30;

        if (params.oversold >= params.overbought) {
            throw new Error('Oversold level must be lower than Overbought level');
        }
    }

    prepare(candles: Candle[], params: any) {
        // Defaults if not validated before (though validateParameters should handle it)
        this.params = {
            period: params?.period || 14,
            overbought: params?.overbought || 70,
            oversold: params?.oversold || 30
        };

        const closePrices = candles.map(c => c.close);
        this.rsiValues = RSI.calculate({ period: this.params.period, values: closePrices });
    }

    onCandle(index: number, candle: Candle, position: number, balance: number): StrategySignal {
        const { period, overbought, oversold } = this.params;

        // Alignment: RSI array length is Input - Period.
        // rsi[0] corresponds to closePrices[period].
        // So we need index - period.

        const rsiIndex = index - period;
        if (rsiIndex < 0) return { action: 'HOLD' };

        const currentRsi = this.rsiValues[rsiIndex];
        const prevRsi = this.rsiValues[rsiIndex - 1];

        if (!currentRsi || !prevRsi) return { action: 'HOLD' };

        // Buy: RSI < Oversold (and maybe crossing back up?)
        // Simple Logic: If RSI drops below oversold, it's cheap -> BUY.
        // Better Logic: Buy when it crosses UP from oversold (Reversal).
        // Let's implement Reversal: Prev < Oversold AND Current > Oversold?
        // Or just "If below 30, buy".
        // Let's stick to standard mean reversion: 
        // Buy when crossing UP above Oversold.

        if (prevRsi <= oversold && currentRsi > oversold) {
            return { action: 'BUY' };
        }

        // Sell: RSI > Overbought (Cross Down)
        if (prevRsi >= overbought && currentRsi < overbought) {
            return { action: 'SELL' };
        }

        return { action: 'HOLD' };
    }
}
