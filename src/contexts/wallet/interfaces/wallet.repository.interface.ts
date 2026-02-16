import { WalletEntity } from '../wallet.entity';

export interface IWalletRepository {
    findByUserId(userId: string): Promise<WalletEntity[]>;
    findByUserAndCurrency(userId: string, currency: string): Promise<WalletEntity | null>;
    save(wallet: WalletEntity): Promise<WalletEntity>;
    create(wallet: Partial<WalletEntity>): WalletEntity;
    remove(wallet: WalletEntity): Promise<WalletEntity>;
}
