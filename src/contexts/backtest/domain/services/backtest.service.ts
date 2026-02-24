import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { MarketService } from '../../../market/domain/services/market.service';
import { RunBacktestDto } from '../../application/dto/run-backtest.dto';
import { BrokerService } from '../../../trade/domain/services/broker.service';
import { StrategyRegistry } from '../strategies/strategy.registry';
import { calculateMetrics } from '../utils/backtest-metrics';

@Injectable()
export class BacktestService {
    private readonly logger = new Logger(BacktestService.name);

    constructor(
        private readonly marketService: MarketService,
        private readonly brokerService: BrokerService,
        private readonly strategyRegistry: StrategyRegistry
    ) { }

    async compareBrokers(dto: RunBacktestDto) {
        const brokers = this.brokerService.getBrokers();
        const results: any[] = [];

        for (const broker of brokers) {
            const runDto = { ...dto, brokerId: broker.id };
            try {
                const result = await this.runBacktest(runDto);
                results.push({
                    broker: broker.name,
                    finalEquity: result.finalEquity,
                    totalReturn: result.totalReturn,
                    tradesCount: result.tradesCount
                });
            } catch (e) {
                this.logger.warn(`Backtest failed for broker ${broker.name}: ${e.message}`);
            }
        }
        return results.sort((a, b) => b.finalEquity - a.finalEquity);
    }

    async runBacktest(dto: RunBacktestDto) {
        const { symbol, timeframe, initialCapital, strategy: strategyName, parameters, limit, brokerId, provider } = dto;

        // 1. Fetch History
        const candles = await this.marketService.getCandles(symbol, timeframe, limit || 100, provider);

        if (candles.length < 10) throw new BadRequestException('Not enough data for backtest');

        // 2. Load Strategy
        const strategy = this.strategyRegistry.get(strategyName);
        if (strategy.validateParameters) {
            strategy.validateParameters(parameters);
        }
        await strategy.prepare(candles, parameters);

        // 3. Virtual Wallet
        let balance = initialCapital; // USD
        let position = 0; // Amount of Asset
        const trades: any[] = [];
        const equityCurve: any[] = [];
        let totalFees = 0;

        const effectiveBrokerId = brokerId || 'binance';

        // 4. Execution Loop
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const price = candle.close;
            const timestamp = candle.timestamp;

            // Get Signal
            const signal = strategy.onCandle(i, candle, position, balance);

            if (signal.action === 'BUY') {
                if (balance > 0) {
                    // Buy All
                    // Calculate Fee
                    const roughAmount = balance / price;
                    const feeValue = this.brokerService.calculateFee(roughAmount, price, 'TAKER', effectiveBrokerId);

                    const netBalance = balance - feeValue;
                    if (netBalance > 0) {
                        const amount = netBalance / price;

                        position = amount;
                        balance = 0;
                        totalFees += feeValue;

                        trades.push({ type: 'BUY', price, amount, fee: feeValue, timestamp, equity: balance + position * price });
                    }
                }
            } else if (signal.action === 'SELL') {
                if (position > 0) {
                    // Sell All
                    const earnings = position * price;
                    const feeValue = this.brokerService.calculateFee(position, price, 'TAKER', effectiveBrokerId);

                    balance = earnings - feeValue;
                    if (balance < 0) balance = 0;

                    position = 0;
                    totalFees += feeValue;

                    trades.push({ type: 'SELL', price, fee: feeValue, timestamp, equity: balance });
                }
            }

            equityCurve.push({ time: timestamp, value: balance + position * price });
        }

        // 5. Final Report
        const finalEquity = balance + (position * candles[candles.length - 1].close);
        const totalReturn = ((finalEquity - initialCapital) / initialCapital) * 100;

        // 6. Advanced Metrics
        const metrics = calculateMetrics(initialCapital, finalEquity, trades, equityCurve);

        // 7. Extract Charting Data
        const chartCandles = candles.map(c => ({
            time: Math.floor(c.timestamp.getTime() / 1000),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
        }));

        let indicators = {};
        if (strategy.getParsedIndicators) {
            indicators = strategy.getParsedIndicators(candles);
        }

        return {
            strategy: strategyName,
            broker: effectiveBrokerId,
            initialCapital,
            finalEquity,
            totalFees,
            totalReturn: totalReturn.toFixed(2) + '%',
            tradesCount: trades.length,
            metrics,
            trades,
            equityCurve,
            drawdownCurve: metrics.maxDrawdown.drawdownCurve,
            chartCandles,
            indicators
        };
    }
}
