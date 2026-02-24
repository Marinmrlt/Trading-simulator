import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { RiskEntity } from '../../infrastructure/entities/risk.entity';
import { WalletService } from '../../../wallet/domain/services/wallet.service';
import { InvalidOrderError } from '../errors/trade.errors';

@Injectable()
export class RiskService {
    private readonly logger = new Logger(RiskService.name);

    constructor(
        @InjectRepository(RiskEntity)
        private readonly riskRepo: Repository<RiskEntity>,
        private readonly walletService: WalletService,
    ) { }

    // Get or create risk settings for user
    public async getSettings(userId: string): Promise<RiskEntity> {
        let settings = await this.riskRepo.findOne({ where: { userId } });
        if (!settings) {
            settings = this.riskRepo.create({
                userId,
                maxPositionSizePercent: 25,
                dailyLossLimit: 1000,
                dailyLossUsed: 0,
                lastResetDate: new Date(),
            });
            await this.riskRepo.save(settings);
        }
        return settings;
    }

    // Update user risk settings
    public async updateSettings(
        userId: string,
        updates: { maxPositionSizePercent?: number; dailyLossLimit?: number },
    ): Promise<RiskEntity> {
        const settings = await this.getSettings(userId);
        if (updates.maxPositionSizePercent !== undefined) {
            settings.maxPositionSizePercent = updates.maxPositionSizePercent;
        }
        if (updates.dailyLossLimit !== undefined) {
            settings.dailyLossLimit = updates.dailyLossLimit;
        }
        return this.riskRepo.save(settings);
    }

    // Check if order respects position size limit
    public async checkPositionSize(userId: string, orderValueUSD: number): Promise<void> {
        const settings = await this.getSettings(userId);
        const portfolio = await this.walletService.getPortfolioSummary(userId);
        const totalValue = portfolio.totalValueUSD;

        if (totalValue <= 0) return; // No portfolio to check against

        const positionPercent = (orderValueUSD / totalValue) * 100;
        if (positionPercent > settings.maxPositionSizePercent) {
            throw new InvalidOrderError(
                `Position size ($${orderValueUSD.toFixed(2)}) exceeds limit of ${settings.maxPositionSizePercent}% of portfolio ($${totalValue.toFixed(2)})`
            );
        }
    }

    // Check daily loss limit
    public async checkDailyLoss(userId: string): Promise<void> {
        const settings = await this.getSettings(userId);

        // Reset if new day
        const today = new Date().toDateString();
        const lastReset = settings.lastResetDate ? new Date(settings.lastResetDate).toDateString() : '';
        if (today !== lastReset) {
            settings.dailyLossUsed = 0;
            settings.lastResetDate = new Date();
            await this.riskRepo.save(settings);
        }

        if (settings.dailyLossUsed >= settings.dailyLossLimit) {
            throw new InvalidOrderError(
                `Daily loss limit reached ($${settings.dailyLossUsed.toFixed(2)} / $${settings.dailyLossLimit.toFixed(2)})`
            );
        }
    }

    // Record a loss (called when order closes with negative P&L)
    public async recordLoss(userId: string, loss: number): Promise<void> {
        if (loss >= 0) return; // Not a loss

        const settings = await this.getSettings(userId);
        settings.dailyLossUsed += Math.abs(loss);
        await this.riskRepo.save(settings);
    }

    // Midnight reset of daily counters
    @Cron('0 0 * * *')
    async resetDailyCounters() {
        this.logger.log('Resetting daily loss counters for all users');
        await this.riskRepo.update({}, { dailyLossUsed: 0, lastResetDate: new Date() });
    }
}
