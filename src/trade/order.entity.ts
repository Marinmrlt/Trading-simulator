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

    @Column('float')
    price: number;

    @Column()
    side: 'BUY' | 'SELL';

    @Column({ default: 'MARKET' })
    type: 'MARKET' | 'LIMIT';

    @Column({ default: 'OPEN' })
    status: 'OPEN' | 'FILLED' | 'CANCELLED';

    @Column('float', { nullable: true })
    stopLoss: number;

    @Column('float', { nullable: true })
    takeProfit: number;

    @Column({ type: 'varchar', nullable: true })
    closeReason: 'STOP_LOSS' | 'TAKE_PROFIT' | null;

    @CreateDateColumn()
    createdAt: Date;

    constructor(partial: Partial<OrderEntity>) {
        Object.assign(this, partial);
    }
}
