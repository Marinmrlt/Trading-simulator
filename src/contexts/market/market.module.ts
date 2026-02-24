import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Application
import { MarketController } from './application/controllers/market.controller';

// Domain
import { MarketService } from './domain/services/market.service';
import { AlertService } from './domain/services/alert.service';

// Infrastructure
import { AssetEntity } from './infrastructure/entities/asset.entity';
import { CandleEntity } from './infrastructure/entities/candle.entity';
import { AlertEntity } from './infrastructure/entities/alert.entity';
import { MarketRepository } from './infrastructure/repositories/market.repository';
import { MarketGateway } from './infrastructure/gateway/market.gateway';
import { BinanceMarketDataProvider } from './infrastructure/providers/binance.provider';
import { KrakenMarketDataProvider } from './infrastructure/providers/kraken.provider';
import { CoinbaseMarketDataProvider } from './infrastructure/providers/coinbase.provider';
import { YahooMarketDataProvider } from './infrastructure/providers/yahoo.provider';

const ProviderRegistryFactory = {
  provide: 'PROVIDER_REGISTRY',
  useFactory: (
    binance: BinanceMarketDataProvider,
    kraken: KrakenMarketDataProvider,
    coinbase: CoinbaseMarketDataProvider,
    yahoo: YahooMarketDataProvider,
  ) => {
    return {
      binance,
      kraken,
      coinbase,
      yahoo,
    };
  },
  inject: [BinanceMarketDataProvider, KrakenMarketDataProvider, CoinbaseMarketDataProvider, YahooMarketDataProvider],
};

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity, CandleEntity, AlertEntity])],
  controllers: [MarketController],
  providers: [
    MarketService,
    AlertService,
    MarketGateway,
    BinanceMarketDataProvider,
    KrakenMarketDataProvider,
    CoinbaseMarketDataProvider,
    YahooMarketDataProvider,
    {
      provide: 'MARKET_REPOSITORY',
      useClass: MarketRepository,
    },
    ProviderRegistryFactory,
  ],
  exports: [MarketService, MarketGateway, AlertService],
})
export class MarketModule { }
