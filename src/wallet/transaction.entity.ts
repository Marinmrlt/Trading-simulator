import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    BUY = 'BUY',
    SELL = 'SELL'
}

@Entity('transactions')
export class TransactionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({
        type: 'simple-enum',
        enum: TransactionType
    })
    type: TransactionType;

    @Column('real')
    amount: number;

    @Column()
    currency: string; // 'USD', 'BTC', etc.

    @Column('real', { nullable: true })
    price: number; // For trades

    @CreateDateColumn()
    timestamp: Date;
}
