import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AssetNotFoundError, MarketDataUnavailableError } from '../errors/market.errors';
import { AssetEntity } from '../../infrastructure/entities/asset.entity';
import type { IMarketRepository } from '../ports/market-repository.port';
import { MarketGateway } from '../../infrastructure/gateway/market.gateway';
import type { IMarketDataProvider, Candle } from '../ports/market-data-provider.port';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MarketService implements OnModuleInit {
    private readonly logger = new Logger(MarketService.name);

    constructor(
        @Inject('MARKET_REPOSITORY')
        private readonly assetRepository: IMarketRepository,
        @Inject('PROVIDER_REGISTRY')
        private readonly providerRegistry: Record<string, IMarketDataProvider>,
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

        // Group assets by provider
        const assetsByProvider: Record<string, AssetEntity[]> = {};
        for (const asset of assets) {
            const providerName = asset.provider || 'yahoo';
            if (!assetsByProvider[providerName]) {
                assetsByProvider[providerName] = [];
            }
            assetsByProvider[providerName].push(asset);
        }

        try {
            await Promise.all(Object.entries(assetsByProvider).map(async ([providerName, providerAssets]) => {
                const provider = this.providerRegistry[providerName] || this.providerRegistry['yahoo'];

                let tickers: any[] = [];
                // Try batch first if supported
                if (typeof (provider as any).getBatchTickers === 'function') {
                    tickers = await (provider as any).getBatchTickers(providerAssets.map(a => a.symbol));
                } else {
                    tickers = await provider.getAllTickers();
                }

                for (const asset of providerAssets) {
                    let ticker = tickers.find((t) => t.symbol === asset.symbol);

                    // Fallback to individual getTicker if not found
                    if (!ticker && typeof (provider as any).getBatchTickers !== 'function') {
                        try {
                            ticker = await provider.getTicker(asset.symbol);
                        } catch (e) { /* ignore */ }
                    }

                    if (ticker && !isNaN(ticker.price) && ticker.price > 0) {
                        asset.price = ticker.price;
                        asset.change24h = ticker.change24h;

                        updates.push(asset);

                        // Emit via WebSocket
                        this.marketGateway.emitTicker(asset.symbol, asset.price);

                        // Emit to Internal System (Trading Engine)
                        this.eventEmitter.emit('price.update', { symbol: asset.symbol, price: asset.price });
                    }
                }
            }));

            // Save all batch updates
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
    public async getCandles(symbol: string, timeframe: string, limit: number = 100, providerOverride?: string): Promise<Candle[]> {
        try {
            const asset = await this.assetRepository.findBySymbol(symbol);
            const providerName = providerOverride || asset?.provider || 'yahoo';
            const provider = this.providerRegistry[providerName] || this.providerRegistry['yahoo'];
            return await provider.getKlines(symbol, timeframe, limit);
        } catch (error) {
            this.logger.error(`Failed to fetch candles: ${error.message}`);
            throw new MarketDataUnavailableError({ internal: error.message });
        }
    }
}
