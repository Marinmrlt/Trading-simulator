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

const MarketDataProviderFactory = {
  provide: 'MARKET_DATA_PROVIDER',
  useFactory: (
    binance: BinanceMarketDataProvider,
    kraken: KrakenMarketDataProvider,
    coinbase: CoinbaseMarketDataProvider,
    config: ConfigService,
  ) => {
    const provider = config.get<string>('MARKET_PROVIDER', 'binance');
    switch (provider) {
      case 'kraken': return kraken;
      case 'coinbase': return coinbase;
      default: return binance;
    }
  },
  inject: [BinanceMarketDataProvider, KrakenMarketDataProvider, CoinbaseMarketDataProvider, ConfigService],
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
    {
      provide: 'MARKET_REPOSITORY',
      useClass: MarketRepository,
    },
    MarketDataProviderFactory,
  ],
  exports: [MarketService, MarketGateway, AlertService],
})
export class MarketModule { }
