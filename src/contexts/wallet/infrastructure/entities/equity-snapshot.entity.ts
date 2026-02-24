import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('equity_snapshots')
export class EquitySnapshotEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column('float')
    totalValueUSD: number;

    @CreateDateColumn()
    timestamp: Date;

    constructor(partial: Partial<EquitySnapshotEntity>) {
        Object.assign(this, partial);
    }
}
