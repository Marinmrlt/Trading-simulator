import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { ITradeRepository } from '../../domain/ports/trade-repository.port';

@Injectable()
export class TradeRepository implements ITradeRepository {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly typeOrmRepo: Repository<OrderEntity>,
    ) { }

    async save(order: OrderEntity): Promise<OrderEntity> {
        return this.typeOrmRepo.save(order);
    }

    create(order: Partial<OrderEntity>): OrderEntity {
        return this.typeOrmRepo.create(order);
    }

    async findAllByStatus(status: string): Promise<OrderEntity[]> {
        // @ts-ignore - Status type casting
        return this.typeOrmRepo.find({ where: { status } });
    }

    async findOpenPositions(): Promise<OrderEntity[]> {
        return this.typeOrmRepo.find({
            where: {
                status: 'FILLED',
                side: 'BUY',
                closeReason: IsNull()
            }
        });
    }

    async find(options?: any): Promise<OrderEntity[]> {
        return this.typeOrmRepo.find(options);
    }
}
