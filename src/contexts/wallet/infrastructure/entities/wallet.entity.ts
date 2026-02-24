import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';

@Entity('wallets')
export class WalletEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    currency: string;

    @Column('float', { default: 0 })
    balance: number;

    @Column('float', { default: 0 })
    locked: number;

    constructor(partial: Partial<WalletEntity>) {
        Object.assign(this, partial);
    }
}
