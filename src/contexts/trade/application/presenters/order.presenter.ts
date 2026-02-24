import { ApiProperty } from '@nestjs/swagger';
import { OrderEntity } from '../../infrastructure/entities/order.entity';

export class OrderPresenter {
    @ApiProperty()
    id: string;

    @ApiProperty()
    details: string;

    @ApiProperty({ example: 'FILLED' })
    status: string;

    @ApiProperty({ example: 'MARKET' })
    type: string;

    @ApiProperty({ example: 'BUY' })
    side: string;

    @ApiProperty({ example: 'BTC' })
    symbol: string;

    @ApiProperty({ example: 0.5 })
    amount: number;

    @ApiProperty({ example: 0.5 })
    filledAmount: number;

    @ApiProperty({ example: 50000 })
    price: number;

    @ApiProperty({ required: false })
    stopLoss?: number;

    @ApiProperty({ required: false })
    takeProfit?: number;

    @ApiProperty({ required: false })
    trailingStopPercent?: number;

    @ApiProperty({ required: false })
    highestPrice?: number;

    @ApiProperty({ required: false })
    linkedOrderId?: string;

    @ApiProperty({ required: false })
    closeReason?: string | null;

    @ApiProperty({ required: false })
    pnl?: number;

    @ApiProperty({ example: 0.5 })
    fee: number;

    @ApiProperty({ required: false })
    feeAsset?: string;

    @ApiProperty({ example: 'binance' })
    brokerId: string;

    @ApiProperty({ example: 'GTC' })
    timeInForce: string;

    @ApiProperty({ required: false })
    expiresAt?: Date;

    @ApiProperty()
    createdAt: Date;

    constructor(order: OrderEntity) {
        this.id = order.id;
        this.details = `${order.side} ${order.amount} ${order.symbol} @ $${order.price || 'Market'}`;
        this.status = order.status;
        this.type = order.type;
        this.side = order.side;
        this.symbol = order.symbol;
        this.amount = order.amount;
        this.filledAmount = order.filledAmount || 0;
        this.price = order.price;
        this.stopLoss = order.stopLoss;
        this.takeProfit = order.takeProfit;
        this.trailingStopPercent = order.trailingStopPercent;
        this.highestPrice = order.highestPrice;
        this.linkedOrderId = order.linkedOrderId;
        this.closeReason = order.closeReason;
        this.pnl = order.pnl;
        this.fee = order.fee;
        this.feeAsset = order.feeAsset;
        this.brokerId = order.brokerId;
        this.timeInForce = order.timeInForce || 'GTC';
        this.expiresAt = order.expiresAt;
        this.createdAt = order.createdAt;
    }
}

