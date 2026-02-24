import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('assets')
export class AssetEntity {
    @PrimaryColumn()
    symbol: string; // e.g., BTC

    @Column()
    name: string;   // e.g., Bitcoin

    @Column('float')
    price: number;

    @Column('float')
    change24h: number;

    @Column({ default: 'yahoo' })
    provider: string; // e.g., 'binance', 'yahoo', 'kraken', 'coinbase'

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<AssetEntity>) {
        Object.assign(this, partial);
    }
}
