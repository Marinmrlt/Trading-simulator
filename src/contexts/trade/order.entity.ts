import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    symbol: string;

    @Column('float')
    amount: number;

    @Column('float', { default: 0 })
    filledAmount: number;

    @Column('float')
    price: number;

    @Column()
    side: 'BUY' | 'SELL';

    @Column({ default: 'MARKET' })
    type: 'MARKET' | 'LIMIT';

    @Column({ default: 'OPEN' })
    status: 'OPEN' | 'FILLED' | 'CANCELLED' | 'PARTIALLY_FILLED' | 'EXPIRED';

    @Column('float', { nullable: true })
    stopLoss: number;

    @Column('float', { nullable: true })
    takeProfit: number;

    @Column({ type: 'varchar', nullable: true })
    closeReason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'EXPIRED' | null;

    @Column({ nullable: true })
    brokerId: string;

    @Column('float', { default: 0 })
    fee: number;

    @Column({ nullable: true })
    feeAsset: string;

    @Column('float', { nullable: true })
    pnl: number;

    @Column({ default: 'GTC' })
    timeInForce: 'GTC' | 'GTD' | 'IOC';

    @Column({ type: 'datetime', nullable: true })
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    constructor(partial: Partial<OrderEntity>) {
        Object.assign(this, partial);
    }
}

