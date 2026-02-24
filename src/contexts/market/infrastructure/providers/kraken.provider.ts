import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IMarketDataProvider, Candle, Ticker } from '../../domain/ports/market-data-provider.port';
import { MarketDataUnavailableError } from '../../domain/errors/market.errors';

@Injectable()
export class KrakenMarketDataProvider implements IMarketDataProvider {
    private readonly logger = new Logger(KrakenMarketDataProvider.name);
    private readonly KRAKEN_API = 'https://api.kraken.com/0/public';

    // Kraken uses different pair naming: XXBTZUSD, XETHZUSD, etc.
    private symbolToKraken(symbol: string): string {
        const map: Record<string, string> = {
            BTC: 'XXBTZUSD',
            ETH: 'XETHZUSD',
            SOL: 'SOLUSD',
            XRP: 'XXRPZUSD',
            ADA: 'ADAUSD',
            DOGE: 'XDGUSD',
            DOT: 'DOTUSD',
            MATIC: 'MATICUSD',
            BNB: 'BNBUSD',
        };
        return map[symbol] || `${symbol}USD`;
    }

    async getTicker(symbol: string): Promise<Ticker> {
        const pair = this.symbolToKraken(symbol);
        try {
            const response = await axios.get(`${this.KRAKEN_API}/Ticker`, {
                params: { pair },
            });

            if (response.data.error && response.data.error.length > 0) {
                throw new Error(response.data.error[0]);
            }

            const result = response.data.result;
            const pairKey = Object.keys(result)[0];
            const t = result[pairKey];

            const lastPrice = parseFloat(t.c[0]); // c = last trade closed [price, lot volume]
            const openPrice = parseFloat(t.o);     // o = today's opening price
            const change24h = openPrice > 0 ? ((lastPrice - openPrice) / openPrice) * 100 : 0;

            return { symbol, price: lastPrice, change24h };
        } catch (error) {
            this.logger.error(`Kraken: Failed to fetch ticker for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getAllTickers(): Promise<Ticker[]> {
        try {
            // Kraken's Ticker endpoint accepts multiple pairs
            const pairs = ['XXBTZUSD', 'XETHZUSD', 'SOLUSD', 'XXRPZUSD', 'ADAUSD', 'XDGUSD', 'DOTUSD', 'MATICUSD'];
            const response = await axios.get(`${this.KRAKEN_API}/Ticker`, {
                params: { pair: pairs.join(',') },
            });

            if (response.data.error && response.data.error.length > 0) {
                throw new Error(response.data.error[0]);
            }

            const result = response.data.result;
            const krakenToSymbol: Record<string, string> = {
                XXBTZUSD: 'BTC', XETHZUSD: 'ETH', SOLUSD: 'SOL',
                XXRPZUSD: 'XRP', ADAUSD: 'ADA', XDGUSD: 'DOGE',
                DOTUSD: 'DOT', MATICUSD: 'MATIC',
            };

            return Object.entries(result).map(([pairKey, t]: [string, any]) => {
                const symbol = krakenToSymbol[pairKey] || pairKey;
                const lastPrice = parseFloat(t.c[0]);
                const openPrice = parseFloat(t.o);
                const change24h = openPrice > 0 ? ((lastPrice - openPrice) / openPrice) * 100 : 0;
                return { symbol, price: lastPrice, change24h };
            });
        } catch (error) {
            this.logger.error(`Kraken: Failed to fetch all tickers: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
        const pair = this.symbolToKraken(symbol);
        try {
            // Kraken interval values: 1, 5, 15, 30, 60, 240, 1440, 10080, 21600
            const intervalMap: Record<string, number> = {
                '1m': 1, '5m': 5, '15m': 15, '30m': 30,
                '1h': 60, '4h': 240, '1d': 1440, '1w': 10080,
            };
            const krakenInterval = intervalMap[interval] || 60;

            const response = await axios.get(`${this.KRAKEN_API}/OHLC`, {
                params: { pair, interval: krakenInterval },
            });

            if (response.data.error && response.data.error.length > 0) {
                throw new Error(response.data.error[0]);
            }

            const result = response.data.result;
            const pairKey = Object.keys(result).find(k => k !== 'last');
            const ohlc = result[pairKey!] || [];

            // Kraken format: [time, open, high, low, close, vwap, volume, count]
            return ohlc.slice(-limit).map((k: any[]) => ({
                symbol,
                timeframe: interval,
                timestamp: new Date(k[0] * 1000),
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[6]),
            }));
        } catch (error) {
            this.logger.error(`Kraken: Failed to fetch candles for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }
}
