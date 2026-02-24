import { Injectable, Logger } from '@nestjs/common';
import yahooFinanceLib from 'yahoo-finance2';
const YahooFinance = (yahooFinanceLib as any).default || yahooFinanceLib;
const yahooFinance = new YahooFinance();
import { IMarketDataProvider, Candle, Ticker } from '../../domain/ports/market-data-provider.port';
import { MarketDataUnavailableError } from '../../domain/errors/market.errors';

@Injectable()
export class YahooMarketDataProvider implements IMarketDataProvider {
    private readonly logger = new Logger(YahooMarketDataProvider.name);

    // Map internal symbols to Yahoo Finance symbols
    // e.g., 'AAPL' -> 'AAPL', 'BTC-USD' -> 'BTC-USD'
    private getYahooSymbol(symbol: string): string {
        return symbol; // In this setup, we'll store them directly under their Yahoo names.
    }

    async getTicker(symbol: string): Promise<Ticker> {
        const yahooSymbol = this.getYahooSymbol(symbol);
        try {
            const quote = await yahooFinance.quote(yahooSymbol) as any;

            // Handle regular market price
            const price = quote.regularMarketPrice || quote.price || 0;
            const changePercent = quote.regularMarketChangePercent || 0;

            if (price === 0) {
                this.logger.warn(`Ticker ${yahooSymbol} returned 0 price.`);
            }

            return {
                symbol,
                price: price,
                change24h: changePercent
            };
        } catch (error) {
            this.logger.error(`Failed to fetch ticker for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }

    async getAllTickers(): Promise<Ticker[]> {
        // Yahoo Finance does not have a single endpoint to fetch "all" tickers globally.
        // We will implement this by relying on the Consumer (MarketService) calling `getTicker` iteratively or 
        // batching requested symbols. Since MarketService currently calls getAllTickers to update known assets,
        // we should adapt this by letting MarketService pass an array of symbols, or we return an empty array 
        // and force the poll to use individual quotes.
        // 
        // For compatibility with the current IMarketDataProvider, we'll return an empty array here,
        // and modify MarketService to use fetch-by-symbol or batch quoting.
        return [];
    }

    // Batch fetch specific tickers (Useful for MarketService)
    async getBatchTickers(symbols: string[]): Promise<Ticker[]> {
        if (symbols.length === 0) return [];
        try {
            const quotes = await yahooFinance.quote(symbols.map(s => this.getYahooSymbol(s))) as any;
            return quotes.map((q: any) => ({
                symbol: symbols.find(s => this.getYahooSymbol(s) === q.symbol) || q.symbol, // Best effort mapping back
                price: q.regularMarketPrice || 0,
                change24h: q.regularMarketChangePercent || 0
            }));
        } catch (error) {
            this.logger.error(`Failed to fetch batch tickers: ${error.message}`);
            return [];
        }
    }

    async getKlines(symbol: string, interval: string, limit: number): Promise<Candle[]> {
        const yahooSymbol = this.getYahooSymbol(symbol);
        try {
            // Map timeframe: 1h -> 1h, 1d -> 1d.
            // Yahoo supports: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
            let validInterval = '1d';
            if (interval === '1h') validInterval = '1h';
            else if (interval === '1d') validInterval = '1d';
            else if (interval === '1w') validInterval = '1wk';
            else if (['1m', '5m', '15m', '30m', '60m'].includes(interval)) validInterval = interval;

            // Compute period1 (start date) based on limit and interval roughly
            const now = new Date();
            let start = new Date(now);
            if (validInterval.includes('h')) {
                start.setHours(start.getHours() - (limit * parseInt(validInterval)));
            } else if (validInterval.includes('d')) {
                start.setDate(start.getDate() - (limit * parseInt(validInterval)));
            } else if (validInterval === '1wk') {
                start.setDate(start.getDate() - (limit * 7));
            } else {
                start.setDate(start.getDate() - limit); // Default fallback
            }

            const queryOptions = {
                period1: start,
                period2: now,
                interval: validInterval as any, // yahooFinance2 typing trick
            };

            const result = await yahooFinance.chart(yahooSymbol, queryOptions) as any;
            const quotes = result?.quotes;

            if (!quotes || quotes.length === 0) {
                return [];
            }

            // Limit to requested amount, array from oldest to newest
            const slicedQuotes = quotes.slice(-limit);

            return slicedQuotes.map((q: any) => ({
                symbol,
                timeframe: interval,
                timestamp: new Date(q.date),
                open: parseFloat(q.open),
                high: parseFloat(q.high),
                low: parseFloat(q.low),
                close: parseFloat(q.close),
                volume: parseFloat(q.volume || 0)
            })).filter(c => !isNaN(c.close) && c.close !== null);

        } catch (error) {
            this.logger.error(`Failed to fetch candles for ${symbol}: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }
}
