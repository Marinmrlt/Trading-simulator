import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './contexts/auth/auth.module';
import { UsersModule } from './contexts/users/users.module';
import { WalletModule } from './contexts/wallet/wallet.module';
import { MarketModule } from './contexts/market/market.module';
import { TradeModule } from './contexts/trade/trade.module';
import { TechnicalAnalysisModule } from './contexts/technical-analysis/technical-analysis.module';
import { BacktestModule } from './contexts/backtest/backtest.module';
import { MailModule } from './core/mail/mail.module';
import { DatabaseModule } from './core/database/database.module';

import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    WalletModule,
    MarketModule,
    TradeModule,
    TechnicalAnalysisModule,
    BacktestModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

