import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletEntity } from './wallet.entity';
import { WalletRepository } from './repositories/wallet.repository';
import { TransactionEntity } from './transaction.entity';
import { TransactionRepository } from './repositories/transaction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WalletEntity, TransactionEntity])],
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
    }
  ],
  exports: [WalletService],
})
export class WalletModule { }
