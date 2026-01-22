import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { MarketModule } from './market/market.module';
import { TradeModule } from './trade/trade.module';
import { TechnicalAnalysisModule } from './technical-analysis/technical-analysis.module';
import { BacktestModule } from './backtest/backtest.module';

import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DB_DATABASE'),
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        logging: config.get<string>('DB_LOGGING') === 'true',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
    }),
    AuthModule,
    UsersModule,
    WalletModule,
    MarketModule,
    TradeModule,
    TechnicalAnalysisModule,
    BacktestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
