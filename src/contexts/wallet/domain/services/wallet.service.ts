import { Injectable, Inject } from '@nestjs/common';
import { WalletNotFoundError, InsufficientFundsError } from '../errors/wallet.errors';
import { WalletEntity } from '../../infrastructure/entities/wallet.entity';
import { TransactionEntity, TransactionType } from '../../infrastructure/entities/transaction.entity';
import type { IWalletRepository } from '../ports/wallet-repository.port';
import type { ITransactionRepository } from '../ports/transaction-repository.port';
import { MarketService } from '../../../market/domain/services/market.service';

@Injectable()
export class WalletService {
    constructor(
        @Inject('WALLET_REPOSITORY')
        private readonly walletRepository: IWalletRepository,
        @Inject('TRANSACTION_REPOSITORY')
        private readonly transactionRepository: ITransactionRepository,
        @Inject('MARKET_SERVICE')
        private readonly marketService: MarketService,
    ) { }

    public async getWallet(userId: string, currency: string): Promise<WalletEntity | null> {
        return this.walletRepository.findByUserAndCurrency(userId, currency);
    }

    public async getBalances(userId: string): Promise<WalletEntity[]> {
        return this.walletRepository.findByUserId(userId);
    }

    public async deposit(userId: string, amount: number, currency: string): Promise<WalletEntity> {
        let wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);

        if (!wallet) {
            wallet = this.walletRepository.create({ userId, currency, balance: 0 });
        }

        wallet.balance += amount;
        await this.walletRepository.save(wallet);

        // Log transaction
        await this.transactionRepository.createTransaction({
            userId,
            type: TransactionType.DEPOSIT,
            amount,
            currency,
            timestamp: new Date()
        });

        return wallet;
    }

    public async withdraw(userId: string, amount: number, currency: string): Promise<WalletEntity> {
        const wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);
        if (!wallet) {
            throw new WalletNotFoundError(userId, currency);
        }

        const available = wallet.balance - wallet.locked;
        if (available < amount) {
            throw new InsufficientFundsError();
        }

        wallet.balance -= amount;
        await this.walletRepository.save(wallet);

        // Log transaction
        await this.transactionRepository.createTransaction({
            userId,
            type: TransactionType.WITHDRAWAL,
            amount,
            currency,
            timestamp: new Date()
        });

        return wallet;
    }

    public async getPortfolioSummary(userId: string): Promise<{ wallets: any[]; totalValueUSD: number }> {
        const wallets = await this.walletRepository.findByUserId(userId);
        let totalValueUSD = 0;

        const walletDetails: { currency: string; balance: number; locked: number; available: number; valueUSD: number }[] = [];

        for (const wallet of wallets) {
            let valueUSD = 0;

            if (wallet.currency === 'USD') {
                valueUSD = wallet.balance;
            } else {
                try {
                    const asset = await this.marketService.getPrice(wallet.currency);
                    valueUSD = wallet.balance * asset.price;
                } catch {
                    // Asset not found or no price — skip valuation
                    valueUSD = 0;
                }
            }

            totalValueUSD += valueUSD;
            walletDetails.push({
                currency: wallet.currency,
                balance: wallet.balance,
                locked: wallet.locked,
                available: wallet.balance - wallet.locked,
                valueUSD: Math.round(valueUSD * 100) / 100,
            });
        }

        return {
            wallets: walletDetails,
            totalValueUSD: Math.round(totalValueUSD * 100) / 100,
        };
    }

    public async getTransactions(userId: string): Promise<TransactionEntity[]> {
        return this.transactionRepository.findAllByUserId(userId);
    }

    // Lock funds for an active order
    public async lockFunds(userId: string, currency: string, amount: number): Promise<void> {
        if (amount <= 0) return;

        const wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);
        if (!wallet) {
            throw new WalletNotFoundError(userId, currency);
        }

        const available = wallet.balance - wallet.locked;
        if (available < amount) {
            throw new InsufficientFundsError();
        }

        wallet.locked += amount;
        await this.walletRepository.save(wallet);
    }

    // Unlock funds (e.g. order cancelled)
    public async unlockFunds(userId: string, currency: string, amount: number): Promise<void> {
        if (amount <= 0) return;

        const wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);
        if (wallet) {
            wallet.locked = Math.max(0, wallet.locked - amount);
            await this.walletRepository.save(wallet);
        }
    }

    // Deduct funds (e.g. order filled - moves balance and locked down)
    public async deductFunds(userId: string, currency: string, amount: number): Promise<void> {
        if (amount <= 0) return;

        const wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);
        if (!wallet) {
            throw new WalletNotFoundError(userId, currency);
        }

        if (wallet.balance < amount) {
            throw new InsufficientFundsError();
        }

        wallet.balance -= amount;
        wallet.locked = Math.max(0, wallet.locked - amount);
        await this.walletRepository.save(wallet);
    }

    // Add funds (e.g. Sell filled)
    public async addFunds(userId: string, currency: string, amount: number): Promise<void> {
        if (amount <= 0) return;

        let wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);
        if (!wallet) {
            wallet = this.walletRepository.create({ userId, currency, balance: 0 });
        }

        wallet.balance += amount;
        await this.walletRepository.save(wallet);
    }

    // Log a trade (BUY/SELL) as a transaction
    public async logTradeTransaction(
        userId: string,
        side: 'BUY' | 'SELL',
        amount: number,
        currency: string,
        price: number,
    ): Promise<void> {
        await this.transactionRepository.createTransaction({
            userId,
            type: side === 'BUY' ? TransactionType.BUY : TransactionType.SELL,
            amount,
            currency,
            price,
            timestamp: new Date(),
        });
    }

    // Reset account — wipe all wallets and re-create USD with $10k
    public async resetAccount(userId: string): Promise<WalletEntity> {
        const wallets = await this.walletRepository.findByUserId(userId);

        // Delete all existing wallets
        for (const wallet of wallets) {
            await this.walletRepository.remove(wallet);
        }

        // Re-create fresh USD wallet with $10k
        const freshWallet = this.walletRepository.create({
            userId,
            currency: 'USD',
            balance: 10000,
        });
        const saved = await this.walletRepository.save(freshWallet);

        // Log transaction
        await this.transactionRepository.createTransaction({
            userId,
            type: TransactionType.DEPOSIT,
            amount: 10000,
            currency: 'USD',
            timestamp: new Date(),
        });

        return saved;
    }
}
