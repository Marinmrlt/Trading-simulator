import { Module } from '@nestjs/common';
import { BacktestController } from './backtest.controller';
import { BacktestService } from './backtest.service';
import { MarketModule } from '../market/market.module';
import { TradeModule } from '../trade/trade.module'; // If we need BrokerService, maybe export it from TradeModule? 
// Or better: import BrokerService directly if it's shared, or import TradeModule if it exports it.
// TradeModule exports TradeService... let's check.
// I can just provide BrokerService here too or export it from TradeModule.
import { BrokerService } from '../trade/brokers/broker.service';
import { StrategyRegistry } from './strategies/strategy.registry';

@Module({
    imports: [MarketModule],
    controllers: [BacktestController],
    providers: [BacktestService, BrokerService, StrategyRegistry],
})
export class BacktestModule { }
