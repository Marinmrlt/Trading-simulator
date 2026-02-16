import { Injectable, NotImplementedException } from '@nestjs/common';
import { IExchangeAdapter } from '../interfaces/exchange-adapter.interface';
import { OrderEntity } from '../order.entity';

@Injectable()
export class BinanceAdapter implements IExchangeAdapter {
    async executeOrder(order: OrderEntity): Promise<OrderEntity> {
        throw new NotImplementedException('Live trading with Binance not yet implemented');
    }

    async cancelOrder(order: OrderEntity): Promise<boolean> {
        throw new NotImplementedException('Live trading with Binance not yet implemented');
    }

    async getBalance(asset: string): Promise<number> {
        throw new NotImplementedException('Live trading with Binance not yet implemented');
    }
}
