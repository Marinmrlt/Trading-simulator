import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity } from './order.entity';

export class OrderPresenter {
    @ApiProperty()
    id: string;

    @ApiProperty()
    details: string;

    @ApiProperty({ example: 'FILLED' })
    status: string;

    @ApiProperty({ example: 'MARKET' })
    type: string;

    @ApiProperty({ required: false })
    stopLoss?: number;

    @ApiProperty({ required: false })
    takeProfit?: number;

    constructor(order: OrderEntity) {
        this.id = order.id;
        this.details = `${order.side} ${order.amount} ${order.symbol} @ $${order.price || 'Market'}`;
        this.status = order.status;
        this.type = order.type;
        this.stopLoss = order.stopLoss;
        this.takeProfit = order.takeProfit;
    }
}
