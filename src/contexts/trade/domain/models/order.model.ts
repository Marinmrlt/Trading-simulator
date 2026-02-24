// Pure domain model interface — NO framework imports
export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED' | 'PARTIALLY_FILLED' | 'EXPIRED';
export type OrderCloseReason = 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP' | 'OCO_CANCELLED' | 'EXPIRED' | null;
export type TimeInForce = 'GTC' | 'GTD' | 'IOC';

export interface IOrder {
    id: string;
    userId: string;
    symbol: string;
    amount: number;
    filledAmount: number;
    price: number;
    side: OrderSide;
    type: OrderType;
    status: OrderStatus;
    stopLoss: number | null;
    takeProfit: number | null;
    closeReason: OrderCloseReason;
    trailingStopPercent: number | null;
    highestPrice: number | null;
    linkedOrderId: string | null;
    brokerId: string | null;
    fee: number;
    feeAsset: string | null;
    pnl: number | null;
    timeInForce: TimeInForce;
    expiresAt: Date | null;
    createdAt: Date;
}
