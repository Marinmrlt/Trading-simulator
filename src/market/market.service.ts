import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { AssetEntity } from './asset.entity';
import type { IMarketRepository } from './interfaces/market.repository.interface';
import { MarketGateway } from './market.gateway';
import axios from 'axios';

@Injectable()
export class MarketService implements OnModuleInit {
    private readonly logger = new Logger(MarketService.name);
    private readonly BINANCE_API = 'https://api.binance.com/api/v3';

    constructor(
        @Inject('MARKET_REPOSITORY')
        private readonly assetRepository: IMarketRepository,
        private readonly marketGateway: MarketGateway,
    ) { }

    async onModuleInit() {
        await this.seedAssets();

        // Poll Real Market Data
        setInterval(() => {
            this.pollMarketData();
        }, 3000); // Every 3 seconds to avoid rate limits (Binance allows 1200 weight/min)
    }

    private async seedAssets() {
        // Ensure we have a good list of assets
        const count = await this.assetRepository.count();
        if (count === 0) {
            await this.assetRepository.save([
                { symbol: 'BTC', name: 'Bitcoin', price: 0, change24h: 0 },
                { symbol: 'ETH', name: 'Ethereum', price: 0, change24h: 0 },
                { symbol: 'SOL', name: 'Solana', price: 0, change24h: 0 },
                { symbol: 'XRP', name: 'Ripple', price: 0, change24h: 0 },
                { symbol: 'BNB', name: 'Binance Coin', price: 0, change24h: 0 },
                { symbol: 'ADA', name: 'Cardano', price: 0, change24h: 0 },
                { symbol: 'DOGE', name: 'Dogecoin', price: 0, change24h: 0 },
                { symbol: 'DOT', name: 'Polkadot', price: 0, change24h: 0 },
                { symbol: 'MATIC', name: 'Polygon', price: 0, change24h: 0 },
            ] as AssetEntity[]);
        }
    }

    private async pollMarketData() {
        const assets = await this.assetRepository.find();
        const updates: AssetEntity[] = [];

        try {
            // Better: GET /api/v3/ticker/24hr returns ALL symbols. We filter what we need.

            const response = await axios.get(`${this.BINANCE_API}/ticker/24hr`);
            const data = response.data; // Array of objects

            for (const asset of assets) {
                const pair = `${asset.symbol}USDT`;
                const ticker = data.find((t: any) => t.symbol === pair);

                if (ticker) {
                    // Update DB (optional, maybe too frequent write? In-memory cache is better for high frequency)
                    // For Simulator simplicity: Write to DB so other services (Trade) see fresh price.
                    asset.price = parseFloat(ticker.lastPrice);
                    asset.change24h = parseFloat(ticker.priceChangePercent);

                    updates.push(asset);

                    // Emit via WebSocket
                    this.marketGateway.emitTicker(asset.symbol, asset.price);
                }
            }

            // Save batch
            if (updates.length > 0) {
                await this.assetRepository.save(updates);
            }
        } catch (error) {
            this.logger.error(`Failed to fetch market data: ${error.message}`);
        }
    }

    public async getAssets(): Promise<AssetEntity[]> {
        return this.assetRepository.find();
    }

    public async getPrice(symbol: string): Promise<AssetEntity | null> {
        return this.assetRepository.findBySymbol(symbol);
    }

    // Real Candle Data (K-Lines)
    public async getCandles(symbol: string, timeframe: string): Promise<any[]> {
        try {
            // Map timeframe: 1h -> 1h, 1d -> 1d. Binance supports 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
            const validIntervals = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
            const interval = validIntervals.includes(timeframe) ? timeframe : '1h';

            const pair = `${symbol}USDT`;
            const response = await axios.get(`${this.BINANCE_API}/klines`, {
                params: {
                    symbol: pair,
                    interval: interval,
                    limit: 100 // Fetch last 100 candles
                }
            });

            // Binance format: [Open time, Open, High, Low, Close, Volume, Close time, ...]
            return response.data.map((k: any[]) => ({
                symbol,
                timeframe,
                timestamp: new Date(k[0]),
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));
        } catch (error) {
            this.logger.error(`Failed to fetch candles: ${error.message}`);
            return [];
        }
    }
}
