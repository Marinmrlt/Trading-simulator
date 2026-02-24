import { Module } from '@nestjs/common';

// Application
import { BacktestController } from './application/controllers/backtest.controller';

// Domain
import { BacktestService } from './domain/services/backtest.service';
import { StrategyRegistry } from './domain/strategies/strategy.registry';

// Cross-module
import { MarketModule } from '../market/market.module';
import { BrokerService } from '../trade/domain/services/broker.service';

@Module({
    imports: [MarketModule],
    controllers: [BacktestController],
    providers: [BacktestService, BrokerService, StrategyRegistry],
})
export class BacktestModule { }
