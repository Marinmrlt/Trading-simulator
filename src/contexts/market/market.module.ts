import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { AssetEntity } from './asset.entity';
import { MarketRepository } from './repositories/market.repository';
import { CandleEntity } from './candle.entity';
import { MarketGateway } from './market.gateway';
import { BinanceMarketDataProvider } from './providers/binance.provider';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity, CandleEntity])],
  controllers: [MarketController],
  providers: [
    MarketService,
    MarketGateway,
    {
      provide: 'MARKET_REPOSITORY',
      useClass: MarketRepository,
    },
    {
      provide: 'MARKET_DATA_PROVIDER',
      useClass: BinanceMarketDataProvider,
    }
  ],
  exports: [MarketService, MarketGateway],
})
export class MarketModule { }
