import { OrderEntity } from '../../infrastructure/entities/order.entity';

export interface IExchangeAdapter {
    /**
     * Executes an order on the exchange.
     * @param order The order to execute (persisted in DB)
     * @returns The updated order with execution details (price, fee, status)
     */
    executeOrder(order: OrderEntity): Promise<OrderEntity>;

    /**
     * Cancels an open order on the exchange.
     * @param order The order to cancel
     */
    cancelOrder(order: OrderEntity): Promise<boolean>;

    /**
     * Fetches current balance for an asset.
     * Optional for now, mostly for sync.
     */
    getBalance(asset: string): Promise<number>;
}
