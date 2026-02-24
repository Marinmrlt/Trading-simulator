import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('price_alerts')
export class AlertEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    symbol: string;

    @Column()
    condition: 'ABOVE' | 'BELOW';

    @Column('float')
    targetPrice: number;

    @Column({ default: false })
    triggered: boolean;

    @CreateDateColumn()
    createdAt: Date;

    constructor(partial: Partial<AlertEntity>) {
        Object.assign(this, partial);
    }
}
