import { TransactionEntity } from '../../infrastructure/entities/transaction.entity';

export interface ITransactionRepository {
    createTransaction(data: Partial<TransactionEntity>): Promise<TransactionEntity>;
    findAllByUserId(userId: string): Promise<TransactionEntity[]>;
}
