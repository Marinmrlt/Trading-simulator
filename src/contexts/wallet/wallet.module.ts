import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletEntity } from './wallet.entity';
import { WalletRepository } from './repositories/wallet.repository';
import { TransactionEntity } from './transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';
import { MarketModule } from '../market/market.module';
import { MarketService } from '../market/market.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, TransactionEntity]),
    forwardRef(() => MarketModule),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    {
      provide: 'WALLET_REPOSITORY',
      useClass: WalletRepository,
    },
    {
      provide: 'TRANSACTION_REPOSITORY',
      useClass: TransactionRepository,
    },
    {
      provide: 'MARKET_SERVICE',
      useExisting: MarketService,
    },
  ],
  exports: [WalletService],
})
export class WalletModule { }

