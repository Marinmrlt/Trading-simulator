import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { WalletEntity } from './wallet.entity';
import { TransactionEntity, TransactionType } from './transaction.entity';
import type { IWalletRepository } from './interfaces/wallet.repository.interface';
import type { ITransactionRepository } from './interfaces/transaction.repository.interface';

@Injectable()
export class WalletService {
    constructor(
        @Inject('WALLET_REPOSITORY')
        private readonly walletRepository: IWalletRepository,
        @Inject('TRANSACTION_REPOSITORY')
        private readonly transactionRepository: ITransactionRepository,
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

        // Log transaction but return the wallet state
        await this.transactionRepository.createTransaction({
            userId,
            type: TransactionType.DEPOSIT,
            amount,
            currency,
            timestamp: new Date()
        });

        return wallet;
    }

    public async getTransactions(userId: string): Promise<TransactionEntity[]> {
        return this.transactionRepository.findAllByUserId(userId);
    }

    // Lock funds for an active order
    public async lockFunds(userId: string, currency: string, amount: number): Promise<void> {
        if (amount <= 0) return;

        const wallet = await this.walletRepository.findByUserAndCurrency(userId, currency);
        if (!wallet) {
            throw new BadRequestException('Insufficient funds (wallet not found)');
        }

        const available = wallet.balance - wallet.locked;
        if (available < amount) {
            throw new BadRequestException('Insufficient funds');
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
        if (!wallet) return;

        // Assuming funds were locked first. 
        // We reduce balance AND locked amount because standard flow is Lock -> Deduct.
        // If funds were NOT locked (instant market buy without lock step), we should just reduce balance.
        // But for safety in trading engine, we usually lock first.
        // Let's implement safe check: reduce locked if it's > 0, otherwise just balance?
        // No, strict trading engine: Market Buy -> Lock USD -> Fill -> Deduct USD (from locked) -> Credit BTC.

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
}
