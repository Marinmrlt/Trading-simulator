import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { EquitySnapshotEntity } from '../../infrastructure/entities/equity-snapshot.entity';
import { WalletService } from './wallet.service';
import type { IWalletRepository } from '../ports/wallet-repository.port';

@Injectable()
export class EquitySnapshotService {
    private readonly logger = new Logger(EquitySnapshotService.name);

    constructor(
        @InjectRepository(EquitySnapshotEntity)
        private readonly snapshotRepo: Repository<EquitySnapshotEntity>,
        private readonly walletService: WalletService,
        @Inject('WALLET_REPOSITORY')
        private readonly walletRepository: IWalletRepository,
    ) { }

    // Record a snapshot for a user
    public async recordSnapshot(userId: string): Promise<EquitySnapshotEntity> {
        const portfolio = await this.walletService.getPortfolioSummary(userId);

        const snapshot = this.snapshotRepo.create({
            userId,
            totalValueUSD: portfolio.totalValueUSD,
        });

        return this.snapshotRepo.save(snapshot);
    }

    // Get equity curve data for a user
    public async getEquityCurve(userId: string, days: number = 30): Promise<EquitySnapshotEntity[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        return this.snapshotRepo.find({
            where: {
                userId,
                timestamp: MoreThan(since),
            },
            order: { timestamp: 'ASC' },
        });
    }

    // Hourly cron: snapshot all users who have wallets
    @Cron('0 * * * *')
    async snapshotAllUsers() {
        this.logger.log('Recording equity snapshots...');
        try {
            // Get distinct user IDs from existing snapshots + any known wallets
            const existing = await this.snapshotRepo
                .createQueryBuilder('s')
                .select('DISTINCT s.userId', 'userId')
                .getRawMany();

            const userIds = existing.map(r => r.userId);

            for (const userId of userIds) {
                await this.recordSnapshot(userId);
            }

            this.logger.log(`Recorded ${userIds.length} equity snapshots`);
        } catch (e) {
            this.logger.error(`Failed to snapshot: ${e.message}`);
        }
    }

    // Record snapshot for a user on-demand (called after trades)
    public async recordSnapshotIfNeeded(userId: string): Promise<void> {
        try {
            await this.recordSnapshot(userId);
        } catch (e) {
            this.logger.error(`Failed to record snapshot for ${userId}: ${e.message}`);
        }
    }
}
