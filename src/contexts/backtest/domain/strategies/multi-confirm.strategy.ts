import { IStrategy, StrategySignal } from './strategy.interface';
import type { Candle } from '../../../market/domain/ports/market-data-provider.port';
import { SMA, RSI, MACD } from 'technicalindicators';

export class MultiConfirmStrategy implements IStrategy {
    name = 'MULTI_CONFIRM';
    description = 'Multi-Criteria Strategy: SMA Cross + RSI Filter + MACD Trend Confirmation';

    private smaShort: number[] = [];
    private smaLong: number[] = [];
    private rsiValues: number[] = [];
    private macdValues: any[] = [];

    // Arrays lengths differ, we must track Offsets
    private rsiOffset: number = 0;
    private macdOffset: number = 0;

    private params: {
        smaShortPeriod: number;
        smaLongPeriod: number;
        rsiPeriod: number;
        rsiOverbought: number;
        rsiOversold: number;
        macdFast: number;
        macdSlow: number;
        macdSignal: number;
    };

    validateParameters(params: any) {
        if (!params) {
            throw new Error('MULTICRITERIA requires parameters');
        }
    }

    prepare(candles: Candle[], params: any) {
        this.params = {
            smaShortPeriod: params?.smaShortPeriod || 10,
            smaLongPeriod: params?.smaLongPeriod || 50,
            rsiPeriod: params?.rsiPeriod || 14,
            rsiOverbought: params?.rsiOverbought || 70,
            rsiOversold: params?.rsiOversold || 30,
            macdFast: params?.macdFast || 12,
            macdSlow: params?.macdSlow || 26,
            macdSignal: params?.macdSignal || 9
        };

        const closePrices = candles.map(c => c.close);

        // Calculate all 3 indicators
        this.smaShort = SMA.calculate({ period: this.params.smaShortPeriod, values: closePrices });
        this.smaLong = SMA.calculate({ period: this.params.smaLongPeriod, values: closePrices });

        this.rsiValues = RSI.calculate({ period: this.params.rsiPeriod, values: closePrices });
        this.rsiOffset = closePrices.length - this.rsiValues.length;

        this.macdValues = MACD.calculate({
            values: closePrices,
            fastPeriod: this.params.macdFast,
            slowPeriod: this.params.macdSlow,
            signalPeriod: this.params.macdSignal,
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });
        this.macdOffset = closePrices.length - this.macdValues.length;
    }

    onCandle(index: number, candle: Candle, position: number, balance: number): StrategySignal {
        const { smaShortPeriod, smaLongPeriod, rsiOverbought, rsiOversold } = this.params;

        // Indexes for each indicator
        const idxShort = index - smaShortPeriod + 1;
        const idxLong = index - smaLongPeriod + 1;
        const idxRsi = index - this.rsiOffset;
        const idxMacd = index - this.macdOffset;

        // Ensure we have enough data history for all inputs
        if (idxLong < 1 || idxRsi < 1 || idxMacd < 1) return { action: 'HOLD' };

        const currentShort = this.smaShort[idxShort];
        const prevShort = this.smaShort[idxShort - 1];

        const currentLong = this.smaLong[idxLong];
        const prevLong = this.smaLong[idxLong - 1];

        const currentRsi = this.rsiValues[idxRsi];

        const currentMacd = this.macdValues[idxMacd];
        const prevMacd = this.macdValues[idxMacd - 1];

        if (!currentShort || !currentLong || !currentRsi || !currentMacd) {
            return { action: 'HOLD' };
        }

        // Logic 1: Bullish Confirmation (BUY)
        // 1. SMA: Short is above Long
        // 2. MACD: Histogram just crossed positive (momentum is going UP)
        // 3. RSI: Not Overbought (< 70)

        const isSmaTrendUp = currentShort > currentLong;
        const isMacdCrossingUp = prevMacd.histogram <= 0 && currentMacd.histogram > 0;
        const isRsiSafeToBuy = currentRsi < rsiOverbought;

        if (isSmaTrendUp && isMacdCrossingUp && isRsiSafeToBuy) {
            return { action: 'BUY' };
        }

        // Logic 2: Bearish Confirmation (SELL)
        // 1. SMA: Short crosses below Long OR MACD histogram turns sharply negative
        const isSmaCrossDown = prevShort >= prevLong && currentShort < currentLong;
        const isMacdCrossingDown = prevMacd.histogram >= 0 && currentMacd.histogram < 0;

        if (isSmaCrossDown || isMacdCrossingDown) {
            return { action: 'SELL' };
        }

        return { action: 'HOLD' };
    }

    getParsedIndicators(candles: Candle[]): Record<string, any[]> {
        const smaShortSeries: any[] = [];
        const smaLongSeries: any[] = [];
        const rsiSeries: any[] = [];
        const macdLineSeries: any[] = [];
        const signalLineSeries: any[] = [];
        const macdHistogramSeries: any[] = [];

        for (let i = 0; i < candles.length; i++) {
            // Lightweight Charts expects UNIX timestamps in seconds (if no intra-day, but 1h uses seconds)
            const time = Math.floor(candles[i].timestamp.getTime() / 1000);

            // SMA Short
            const idxShort = i - this.params.smaShortPeriod + 1;
            if (idxShort >= 0 && this.smaShort[idxShort] !== undefined) {
                smaShortSeries.push({ time, value: this.smaShort[idxShort] });
            }

            // SMA Long
            const idxLong = i - this.params.smaLongPeriod + 1;
            if (idxLong >= 0 && this.smaLong[idxLong] !== undefined) {
                smaLongSeries.push({ time, value: this.smaLong[idxLong] });
            }

            // RSI
            const idxRsi = i - this.rsiOffset;
            if (idxRsi >= 0 && this.rsiValues[idxRsi] !== undefined) {
                rsiSeries.push({ time, value: this.rsiValues[idxRsi] });
            }

            // MACD
            const idxMacd = i - this.macdOffset;
            if (idxMacd >= 0 && this.macdValues[idxMacd] !== undefined) {
                const m = this.macdValues[idxMacd];
                if (m.MACD !== undefined) macdLineSeries.push({ time, value: m.MACD });
                if (m.signal !== undefined) signalLineSeries.push({ time, value: m.signal });
                if (m.histogram !== undefined) macdHistogramSeries.push({ time, value: m.histogram, color: m.histogram > 0 ? '#26a69a' : '#ef5350' });
            }
        }

        return {
            smaShort: smaShortSeries,
            smaLong: smaLongSeries,
            rsi: rsiSeries,
            macdLine: macdLineSeries,
            macdSignal: signalLineSeries,
            macdHistogram: macdHistogramSeries
        };
    }
}
