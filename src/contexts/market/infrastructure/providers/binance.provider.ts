import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IMarketDataProvider, Candle, Ticker } from '../../domain/ports/market-data-provider.port';
import { MarketDataUnavailableError } from '../../domain/errors/market.errors';

@Injectable()
export class BinanceMarketDataProvider implements IMarketDataProvider {
    private readonly logger = new Logger(BinanceMarketDataProvider.name);
    private readonly BINANCE_API = 'https://api.binance.com/api/v3';

    async getTicker(symbol: string): Promise<Ticker> {
        // Convert DB symbol (e.g. BTC/USD or BTC-USD) to Binance pair (BTCUSDT)
        const pair = symbol.toUpperCase().replace('/USD', 'USDT').replace('-USD', 'USDT').replace('/', '');
        try {
            const response = await axios.get(`${this.BINANCE_API}/ticker/24hr`, {
                params: { symbol: pair }
            });
            const t = response.data;
            return {
                symbol,
                price: parseFloat(t.lastPrice),
                change24h: parseFloat(t.priceChangePercent)
            };
        } catch (error) {
            this.logger.error(`Failed to fetch ticker for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getAllTickers(): Promise<Ticker[]> {
        try {
            const response = await axios.get(`${this.BINANCE_API}/ticker/24hr`);
            const data = response.data; // Array of objects

            // Transform generic binance data to our Ticker interface
            // Only keeping USDT pairs for simplicity in this simulator context?
            // Or just returning everything and letting service filter.
            // Better to process here to return standard Ticker objects.

            return data.map((t: any) => {
                let symbol = t.symbol;
                if (symbol.endsWith('USDT')) {
                    // Map back to DB symbol format
                    symbol = symbol.replace('USDT', '/USD');
                } else {
                    // Keep only USDT pairs for simulator
                    return null;
                }

                const price = parseFloat(t.lastPrice);
                const change24h = parseFloat(t.priceChangePercent);

                if (isNaN(price)) {
                    // Logger not available in map context easily without closure or instance ref
                    // Just return null/undefined to filter out later or default to 0
                    return null;
                }

                return {
                    symbol: symbol,
                    price: price,
                    change24h: isNaN(change24h) ? 0 : change24h
                };
            }).filter(t => t !== null);
        } catch (error) {
            this.logger.error(`Failed to fetch all tickers: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
        try {
            // Map timeframe: 1h -> 1h, 1d -> 1d. Binance supports 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
            const validIntervals = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
            const validInterval = validIntervals.includes(interval) ? interval : '1h';

            // Convert DB symbol to Binance pair (e.g BTC-USD -> BTCUSDT, BTC/USDT -> BTCUSDT)
            let pair = symbol.toUpperCase();
            if (pair.includes('-USD') || pair.includes('/USD')) {
                pair = pair.replace('/USD', 'USDT').replace('-USD', 'USDT').replace('/', '');
            } else if (!pair.endsWith('USDT') && !pair.endsWith('BTC') && !pair.endsWith('ETH')) {
                // If it's a naked symbol like 'BTC', assume USDT pair for Binance
                pair += 'USDT';
            }

            const response = await axios.get(`${this.BINANCE_API}/klines`, {
                params: {
                    symbol: pair,
                    interval: validInterval,
                    limit: limit
                }
            });

            // Binance format: [Open time, Open, High, Low, Close, Volume, Close time, ...]
            return response.data.map((k: any[]) => ({
                symbol,
                timeframe: interval,
                timestamp: new Date(k[0]),
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));
        } catch (error) {
            this.logger.error(`Failed to fetch candles for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }
}
