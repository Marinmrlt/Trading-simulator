import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Application
import { WalletController } from './application/controllers/wallet.controller';

// Domain
import { WalletService } from './domain/services/wallet.service';
import { EquitySnapshotService } from './domain/services/equity-snapshot.service';

// Infrastructure
import { WalletEntity } from './infrastructure/entities/wallet.entity';
import { TransactionEntity } from './infrastructure/entities/transaction.entity';
import { EquitySnapshotEntity } from './infrastructure/entities/equity-snapshot.entity';
import { WalletRepository } from './infrastructure/repositories/wallet.repository';
import { TransactionRepository } from './infrastructure/repositories/transaction.repository';

// Cross-module
import { MarketModule } from '../market/market.module';
import { MarketService } from '../market/domain/services/market.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, TransactionEntity, EquitySnapshotEntity]),
    forwardRef(() => MarketModule),
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    EquitySnapshotService,
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
  exports: [WalletService, EquitySnapshotService],
})
export class WalletModule { }
