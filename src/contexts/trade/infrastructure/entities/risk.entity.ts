import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('risk_settings')
export class RiskEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    userId: string;

    @Column('float', { default: 25 })
    maxPositionSizePercent: number;

    @Column('float', { default: 1000 })
    dailyLossLimit: number;

    @Column('float', { default: 0 })
    dailyLossUsed: number;

    @Column({ type: 'datetime', nullable: true })
    lastResetDate: Date;

    constructor(partial: Partial<RiskEntity>) {
        Object.assign(this, partial);
    }
}
