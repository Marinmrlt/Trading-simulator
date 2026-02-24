import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IMarketDataProvider, Candle, Ticker } from '../../domain/ports/market-data-provider.port';
import { MarketDataUnavailableError } from '../../domain/errors/market.errors';

@Injectable()
export class CoinbaseMarketDataProvider implements IMarketDataProvider {
    private readonly logger = new Logger(CoinbaseMarketDataProvider.name);
    private readonly COINBASE_API = 'https://api.exchange.coinbase.com';

    async getTicker(symbol: string): Promise<Ticker> {
        const pair = `${symbol}-USD`;
        try {
            const [tickerRes, statsRes] = await Promise.all([
                axios.get(`${this.COINBASE_API}/products/${pair}/ticker`),
                axios.get(`${this.COINBASE_API}/products/${pair}/stats`),
            ]);

            const price = parseFloat(tickerRes.data.price);
            const open = parseFloat(statsRes.data.open);
            const change24h = open > 0 ? ((price - open) / open) * 100 : 0;

            return { symbol, price, change24h };
        } catch (error) {
            this.logger.error(`Coinbase: Failed to fetch ticker for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getAllTickers(): Promise<Ticker[]> {
        try {
            const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC'];
            const tickers: Ticker[] = [];

            // Coinbase doesn't have a bulk ticker endpoint, so we fetch individually
            for (const symbol of symbols) {
                try {
                    const ticker = await this.getTicker(symbol);
                    tickers.push(ticker);
                } catch {
                    // Skip unavailable pairs
                }
            }

            return tickers;
        } catch (error) {
            this.logger.error(`Coinbase: Failed to fetch all tickers: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
        const pair = `${symbol}-USD`;
        try {
            // Coinbase granularity values in seconds: 60, 300, 900, 3600, 21600, 86400
            const granularityMap: Record<string, number> = {
                '1m': 60, '5m': 300, '15m': 900,
                '1h': 3600, '4h': 21600, '1d': 86400,
            };
            const granularity = granularityMap[interval] || 3600;

            const end = new Date().toISOString();
            const startDate = new Date(Date.now() - granularity * limit * 1000);
            const start = startDate.toISOString();

            const response = await axios.get(`${this.COINBASE_API}/products/${pair}/candles`, {
                params: { start, end, granularity },
            });

            // Coinbase format: [[time, low, high, open, close, volume], ...] (newest first)
            return response.data
                .slice(0, limit)
                .reverse()
                .map((k: number[]) => ({
                    symbol,
                    timeframe: interval,
                    timestamp: new Date(k[0] * 1000),
                    open: k[3],
                    high: k[2],
                    low: k[1],
                    close: k[4],
                    volume: k[5],
                }));
        } catch (error) {
            this.logger.error(`Coinbase: Failed to fetch candles for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }
}
