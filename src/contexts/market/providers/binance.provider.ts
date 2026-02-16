import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IMarketDataProvider, Candle, Ticker } from '../interfaces/market-data.provider.interface';
import { MarketDataUnavailableError } from '../errors/market.errors';

@Injectable()
export class BinanceMarketDataProvider implements IMarketDataProvider {
    private readonly logger = new Logger(BinanceMarketDataProvider.name);
    private readonly BINANCE_API = 'https://api.binance.com/api/v3';

    async getTicker(symbol: string): Promise<Ticker> {
        // Binance specific endpoint for single symbol
        const pair = `${symbol}USDT`;
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
                // heuristic to extract symbol from pair? e.g. BTCUSDT -> BTC
                // For now, let's keep the pair name or try to parse if it ends with USDT
                let symbol = t.symbol;
                if (symbol.endsWith('USDT')) {
                    symbol = symbol.replace('USDT', '');
                }

                return {
                    symbol: symbol, // Note: this might include non-USDT pairs if we don't filter. 
                    // But MarketService filters by its known assets anyway.
                    price: parseFloat(t.lastPrice),
                    change24h: parseFloat(t.priceChangePercent)
                };
            });
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

            const pair = `${symbol}USDT`;
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
