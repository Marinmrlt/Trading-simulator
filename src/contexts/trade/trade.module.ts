import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Application
import { TradeController } from './application/controllers/trade.controller';

// Domain
import { TradeService } from './domain/services/trade.service';
import { TradeMonitorService } from './domain/services/trade-monitor.service';
import { RiskService } from './domain/services/risk.service';
import { BrokerService } from './domain/services/broker.service';

// Infrastructure
import { OrderEntity } from './infrastructure/entities/order.entity';
import { RiskEntity } from './infrastructure/entities/risk.entity';
import { TradeRepository } from './infrastructure/repositories/trade.repository';
import { PaperTradingAdapter } from './infrastructure/adapters/paper-trading.adapter';
import { BinanceAdapter } from './infrastructure/adapters/binance.adapter';

// Cross-module
import { MarketModule } from '../market/market.module';
import { WalletModule } from '../wallet/wallet.module';

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
    TypeOrmModule.forFeature([OrderEntity, RiskEntity]),
    MarketModule,
    WalletModule
  ],
  controllers: [TradeController],
  providers: [
    TradeService,
    TradeMonitorService,
    RiskService,
    BrokerService,
    {
      provide: 'TRADE_REPOSITORY',
      useClass: TradeRepository,
    },
    PaperTradingAdapter,
    BinanceAdapter,
    ExchangeAdapterFactory,
  ],
  exports: [TradeService, TradeMonitorService, BrokerService, RiskService],
})
export class TradeModule { }
