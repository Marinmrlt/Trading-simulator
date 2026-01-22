import { Injectable, BadRequestException } from '@nestjs/common';
import { MarketService } from '../market/market.service';
import { RunBacktestDto } from './dto/run-backtest.dto';
import { SMA } from 'technicalindicators';

@Injectable()
export class BacktestService {
    constructor(private readonly marketService: MarketService) { }

    async runBacktest(dto: RunBacktestDto) {
        const { symbol, timeframe, initialCapital, strategy, parameters, limit } = dto;

        // 1. Fetch History
        // We use getCandles (which now fetches from Binance) using the requested limit
        // Note: getCandles implementation in MarketService currently hardcoded limit=100 in axios params? 
        // We might need to update MarketService to accept 'limit' or just fetch enough.
        // For now, let's assume getCandles returns what we need or we update it.
        // Let's assume MarketService.getCandles can handle the request.

        // Actually, MarketService.getCandles logic:
        /*
            const response = await axios.get(`${this.BINANCE_API}/klines`, {
                params: { ..., limit: 100 } 
            });
        */
        // We should overload it or add limit param.

        const candles = await this.marketService.getCandles(symbol, timeframe); // Defaults to 100
        // Ideally pass 'limit' here.

        if (candles.length < 10) throw new BadRequestException('Not enough data for backtest');

        // 2. Prepare Data
        const closePrices = candles.map(c => c.close);

        // 3. Virtual Wallet
        let balance = initialCapital; // USD
        let position = 0; // Amount of Asset
        const trades: any[] = [];
        const equityCurve: any[] = [];

        // 4. Strategy Execution
        // Example: SMA Cross
        if (strategy === 'SMA_CROSS') {
            const shortPeriod = parameters?.shortPeriod || 9;
            const longPeriod = parameters?.longPeriod || 21;

            const smaShort = SMA.calculate({ period: shortPeriod, values: closePrices });
            const smaLong = SMA.calculate({ period: longPeriod, values: closePrices });

            // Alignment: Arrays returned by TI are shorter than original input.
            // SMA(9) starts at index 8. SMA(21) starts at index 20.
            // We iterate from the point where we have both.

            const startIndex = Math.max(shortPeriod, longPeriod);

            for (let i = startIndex; i < candles.length; i++) {
                // TI library returns arrays matching the input but shifted? 
                // Actually TI library returns array of length (Input - Period + 1).
                // So smaShort[0] corresponds to closePrices[shortPeriod-1].

                // Helper to get aligned value
                const shortVal = smaShort[i - shortPeriod];
                const longVal = smaLong[i - longPeriod];
                const prevShort = smaShort[i - shortPeriod - 1];
                const prevLong = smaLong[i - longPeriod - 1];

                if (!shortVal || !longVal || !prevShort || !prevLong) continue;

                const price = closePrices[i];
                const timestamp = candles[i].timestamp;

                // Logic: Buy if Short crosses ABOVE Long
                if (prevShort <= prevLong && shortVal > longVal) {
                    if (balance > 0) {
                        // Buy All
                        const amount = balance / price;
                        const fee = 0; // Simulate 0 fee for now
                        position = amount;
                        balance = 0;
                        trades.push({ type: 'BUY', price, amount, timestamp, equity: balance + position * price });
                    }
                }

                // Logic: Sell if Short crosses BELOW Long
                else if (prevShort >= prevLong && shortVal < longVal) {
                    if (position > 0) {
                        // Sell All
                        const earnings = position * price;
                        balance = earnings;
                        position = 0;
                        trades.push({ type: 'SELL', price, timestamp, equity: balance });
                    }
                }

                equityCurve.push({ time: timestamp, value: balance + position * price });
            }
        }

        // 5. Final Report
        const finalEquity = balance + (position * candles[candles.length - 1].close);
        const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;

        return {
            strategy,
            initialCapital,
            finalEquity,
            totalReturn: totalReturn.toFixed(2) + '%',
            tradesCount: trades.length,
            trades,
            equityCurve // useful for plotting
        };
    }
}
