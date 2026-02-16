import { TransactionEntity } from '../transaction.entity';

export interface ITransactionRepository {
    createTransaction(data: Partial<TransactionEntity>): Promise<TransactionEntity>;
    findAllByUserId(userId: string): Promise<TransactionEntity[]>;
}
