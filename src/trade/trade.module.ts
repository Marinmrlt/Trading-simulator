import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { TradeMonitorService } from './trade-monitor.service';
import { OrderEntity } from './order.entity';
import { TradeRepository } from './repositories/trade.repository';

import { MarketModule } from '../market/market.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    MarketModule,
    WalletModule,
  ],
  controllers: [TradeController],
  providers: [
    TradeService,
    TradeMonitorService,
    {
      provide: 'TRADE_REPOSITORY',
      useClass: TradeRepository,
    }
  ],
  exports: [TradeService, TradeMonitorService],
})
export class TradeModule { }
