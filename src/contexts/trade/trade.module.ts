import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TradeMonitorService } from './trade-monitor.service';
import { OrderEntity } from './order.entity';
import { TradeRepository } from './repositories/trade.repository';
import { MarketModule } from '../market/market.module';
import { WalletModule } from '../wallet/wallet.module';
import { BrokerService } from './brokers/broker.service';
import { PaperTradingAdapter } from './adapters/paper-trading.adapter';
import { BinanceAdapter } from './adapters/binance.adapter';

const ExchangeAdapterFactory = {
  provide: 'IExchangeAdapter',
  useFactory: (paper: PaperTradingAdapter, binance: BinanceAdapter, config: ConfigService) => {
    const mode = config.get<string>('EXCHANGE_MODE', 'PAPER');
    return mode === 'LIVE' ? binance : paper;
  },
  inject: [PaperTradingAdapter, BinanceAdapter, ConfigService],
};

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    MarketModule,
    WalletModule
  ],
  controllers: [TradeController],
  providers: [
    TradeService,
    TradeMonitorService,
    BrokerService,
    {
      provide: 'TRADE_REPOSITORY',
      useClass: TradeRepository,
    },
    PaperTradingAdapter,
    BinanceAdapter,
    ExchangeAdapterFactory,
  ],
  exports: [TradeService, TradeMonitorService, BrokerService],
})
export class TradeModule { }
