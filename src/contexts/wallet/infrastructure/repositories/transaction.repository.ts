import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { ITransactionRepository } from '../../domain/ports/transaction-repository.port';

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> implements ITransactionRepository {
    constructor(dataSource: DataSource) {
        super(TransactionEntity, dataSource.createEntityManager());
    }

    async createTransaction(data: Partial<TransactionEntity>): Promise<TransactionEntity> {
        const transaction = this.create(data);
        return await this.save(transaction);
    }

    async findAllByUserId(userId: string): Promise<TransactionEntity[]> {
        return this.find({
            where: { userId },
            order: { timestamp: 'DESC' }
        });
    }
}
