import { OrderEntity } from '../../infrastructure/entities/order.entity';

export interface ITradeRepository {
    save(order: OrderEntity): Promise<OrderEntity>;
    create(order: Partial<OrderEntity>): OrderEntity;
    findAllByStatus(status: string): Promise<OrderEntity[]>;
    findOpenPositions(): Promise<OrderEntity[]>;
    find(options?: any): Promise<OrderEntity[]>;
}
