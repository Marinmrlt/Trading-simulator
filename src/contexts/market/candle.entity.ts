import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AssetEntity } from './asset.entity';

@Entity('candles')
export class CandleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    symbol: string;

    @Column()
    timeframe: string; // e.g., '1m', '1h', '1d'

    @Column({ type: 'datetime' })
    timestamp: Date;

    @Column('real')
    open: number;

    @Column('real')
    high: number;

    @Column('real')
    low: number;

    @Column('real')
    close: number;

    @Column('real')
    volume: number;

    // Optional: Relation to Asset if strict foreign key is needed
    // @ManyToOne(() => AssetEntity)
    // @JoinColumn({ name: 'symbol', referencedColumnName: 'symbol' })
    // asset: AssetEntity;
}
