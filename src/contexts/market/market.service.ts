import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AssetNotFoundError, MarketDataUnavailableError } from './errors/market.errors';
import { AssetEntity } from './asset.entity';
import type { IMarketRepository } from './interfaces/market.repository.interface';
import { MarketGateway } from './market.gateway';
import type { IMarketDataProvider, Candle } from './interfaces/market-data.provider.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MarketService implements OnModuleInit {
    private readonly logger = new Logger(MarketService.name);

    constructor(
        @Inject('MARKET_REPOSITORY')
        private readonly assetRepository: IMarketRepository,
        @Inject('MARKET_DATA_PROVIDER')
        private readonly marketDataProvider: IMarketDataProvider,
        private readonly marketGateway: MarketGateway,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async onModuleInit() {
        await this.seedAssets();
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

    @Interval(3000)
    private async pollMarketData() {
        const assets = await this.assetRepository.find();
        const updates: AssetEntity[] = [];

        try {
            // Fetch ALL symbols from provider
            const tickers = await this.marketDataProvider.getAllTickers();

            for (const asset of assets) {
                // Provider returns clean symbol (e.g. BTC) or we match against pair?
                // BinanceProvider implementation returns "BTC" for "BTCUSDT".
                // Our AssetEntity has symbol "BTC".

                const ticker = tickers.find((t) => t.symbol === asset.symbol);

                if (ticker) {
                    asset.price = ticker.price;
                    asset.change24h = ticker.change24h;

                    updates.push(asset);

                    // Emit via WebSocket
                    this.marketGateway.emitTicker(asset.symbol, asset.price);

                    // Emit to Internal System (Trading Engine)
                    this.eventEmitter.emit('price.update', { symbol: asset.symbol, price: asset.price });
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

    public async getPrice(symbol: string): Promise<AssetEntity> {
        const asset = await this.assetRepository.findBySymbol(symbol);
        if (!asset) throw new AssetNotFoundError(symbol);
        return asset;
    }

    // Real Candle Data (K-Lines)
    public async getCandles(symbol: string, timeframe: string, limit: number = 100): Promise<Candle[]> {
        try {
            return await this.marketDataProvider.getKlines(symbol, timeframe, limit);
        } catch (error) {
            this.logger.error(`Failed to fetch candles: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }
}
