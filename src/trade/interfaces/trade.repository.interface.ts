import { OrderEntity } from '../order.entity';

export interface ITradeRepository {
    save(order: OrderEntity): Promise<OrderEntity>;
    create(order: Partial<OrderEntity>): OrderEntity;
    findAllByStatus(status: string): Promise<OrderEntity[]>;
    findOpenPositions(): Promise<OrderEntity[]>;
}
