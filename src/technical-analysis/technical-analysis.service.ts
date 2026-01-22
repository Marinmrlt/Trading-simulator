import { Injectable, BadRequestException } from '@nestjs/common';
import { MarketService } from '../market/market.service';
import {
    SMA,
    EMA,
    RSI,
    MACD,
    BollingerBands,
    Stochastic,
    ATR,
    ADX,
    CCI,
    OBV,
    IchimokuCloud,
    VWAP,
    PSAR,
    WilliamsR,
    MFI,
    StochasticRSI,
    ROC,
    ForceIndex,
    AwesomeOscillator,
    TRIX
} from 'technicalindicators';

@Injectable()
export class TechnicalAnalysisService {
    constructor(private readonly marketService: MarketService) { }

    // ... (Existing methods: SMA, EMA, RSI, MACD, Bollinger, Stochastic) ...

    public async getSMA(symbol: string, timeframe: string, period: number) {
        const candles = await this.getPrices(symbol, timeframe);
        return SMA.calculate({ period, values: candles });
    }

    public async getEMA(symbol: string, timeframe: string, period: number) {
        const candles = await this.getPrices(symbol, timeframe);
        return EMA.calculate({ period, values: candles });
    }

    public async getRSI(symbol: string, timeframe: string, period: number) {
        const candles = await this.getPrices(symbol, timeframe);
        return RSI.calculate({ period, values: candles });
    }

    public async getMACD(symbol: string, timeframe: string) {
        const candles = await this.getPrices(symbol, timeframe);
        return MACD.calculate({
            values: candles,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
    }

    public async getBollinger(symbol: string, timeframe: string, period: number, stdDev: number) {
        const candles = await this.getPrices(symbol, timeframe);
        return BollingerBands.calculate({ period, stdDev, values: candles });
    }

    public async getStochastic(symbol: string, timeframe: string, period: number = 14) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return Stochastic.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            period,
            signalPeriod: 3
        });
    }

    // --- Extended Indicators ---

    public async getATR(symbol: string, timeframe: string, period: number = 14) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return ATR.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            period
        });
    }

    public async getADX(symbol: string, timeframe: string, period: number = 14) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return ADX.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            period
        });
    }

    public async getCCI(symbol: string, timeframe: string, period: number = 20) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return CCI.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            period
        });
    }

    public async getOBV(symbol: string, timeframe: string) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return OBV.calculate({
            close: candles.map(c => c.close),
            volume: candles.map(c => c.volume)
        });
    }

    public async getIchimoku(symbol: string, timeframe: string) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return IchimokuCloud.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            conversionPeriod: 9,
            basePeriod: 26,
            spanPeriod: 52,
            displacement: 26
        });
    }

    public async getVWAP(symbol: string, timeframe: string) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return VWAP.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            volume: candles.map(c => c.volume)
        });
    }

    public async getPSAR(symbol: string, timeframe: string) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return PSAR.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            step: 0.02,
            max: 0.2
        });
    }

    public async getWilliamsR(symbol: string, timeframe: string, period: number = 14) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return WilliamsR.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            period
        });
    }

    public async getMFI(symbol: string, timeframe: string, period: number = 14) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return MFI.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            close: candles.map(c => c.close),
            volume: candles.map(c => c.volume),
            period
        });
    }

    public async getStochasticRSI(symbol: string, timeframe: string, rsiPeriod: number = 14, stochasticPeriod: number = 14, kPeriod: number = 3, dPeriod: number = 3) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return StochasticRSI.calculate({
            values: candles.map(c => c.close),
            rsiPeriod,
            stochasticPeriod,
            kPeriod,
            dPeriod
        });
    }

    public async getROC(symbol: string, timeframe: string, period: number = 12) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return ROC.calculate({
            values: candles.map(c => c.close),
            period
        });
    }

    public async getForceIndex(symbol: string, timeframe: string, period: number = 1) { // Force Index is usually period 1 or 13 EMA smoothed
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        // library might default period? let's check basic usage
        return ForceIndex.calculate({
            close: candles.map(c => c.close),
            volume: candles.map(c => c.volume),
            period
        });
    }

    public async getAwesomeOscillator(symbol: string, timeframe: string) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return AwesomeOscillator.calculate({
            high: candles.map(c => c.high),
            low: candles.map(c => c.low),
            fastPeriod: 5,
            slowPeriod: 34
        });
    }

    public async getTRIX(symbol: string, timeframe: string, period: number = 18) {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) throw new BadRequestException('No candle data available');

        return TRIX.calculate({
            values: candles.map(c => c.close),
            period
        });
    }

    // Helper to extract just CLOSE prices for simple indicators
    private async getPrices(symbol: string, timeframe: string): Promise<number[]> {
        const candles = await this.marketService.getCandles(symbol, timeframe);
        if (!candles || candles.length === 0) {
            throw new BadRequestException('No candle data available');
        }
        return candles.map((c) => c.close);
    }
}
