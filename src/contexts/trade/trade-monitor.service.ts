import { Injectable, Logger, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { MarketService } from '../market/market.service';
import { OrderEntity } from './order.entity';
import type { ITradeRepository } from './interfaces/trade.repository.interface';
import { TradeService } from './trade.service';
import { MarketGateway } from '../market/market.gateway';

@Injectable()
export class TradeMonitorService {
    private readonly logger = new Logger(TradeMonitorService.name);

    constructor(
        @Inject('TRADE_REPOSITORY')
        private readonly orderRepository: ITradeRepository,
        private readonly marketService: MarketService,
        private readonly tradeService: TradeService,
        private readonly marketGateway: MarketGateway,
    ) { }

    @Interval(1000)
    async checkOrders() {
        const positions = await this.orderRepository.findOpenPositions();
        if (!positions || positions.length === 0) return;

        for (const order of positions) {
            await this.checkSingleOrder(order);
        }

        // Check GTD expiry on OPEN limit orders
        await this.checkExpiredOrders();
    }

    private async checkSingleOrder(order: OrderEntity) {
        if (order.status !== 'FILLED' || order.side !== 'BUY' || order.closeReason) return;

        const priceItem = await this.marketService.getPrice(order.symbol);
        if (!priceItem) return;

        const currentPrice = priceItem.price;

        // Check Stop Loss (Sell if Price <= SL)
        if (order.stopLoss && currentPrice <= order.stopLoss) {
            await this.executeTrigger(order, currentPrice, 'STOP_LOSS');
            return;
        }

        // Check Take Profit (Sell if Price >= TP)
        if (order.takeProfit && currentPrice >= order.takeProfit) {
            await this.executeTrigger(order, currentPrice, 'TAKE_PROFIT');
            return;
        }
    }

    private async executeTrigger(order: OrderEntity, price: number, reason: 'STOP_LOSS' | 'TAKE_PROFIT') {
        this.logger.log(`Triggering ${reason} for Order #${order.id} @ ${price}`);

        try {
            // Calculate P&L: (exit - entry) * amount
            const pnl = (price - order.price) * order.amount;

            // Delegate to TradeService — goes through the adapter (fees, wallet ops)
            await this.tradeService.placeOrder(order.userId, {
                symbol: order.symbol,
                amount: order.amount,
                side: 'SELL',
                type: 'MARKET',
                brokerId: order.brokerId,
            });

            // Mark parent order as closed with P&L
            order.closeReason = reason;
            order.pnl = Math.round(pnl * 100) / 100;
            await this.orderRepository.save(order);

            // WebSocket alert
            this.marketGateway.emitTradeAlert(order.userId, {
                type: reason,
                orderId: order.id,
                symbol: order.symbol,
                entryPrice: order.price,
                exitPrice: price,
                pnl: order.pnl,
                amount: order.amount,
            });

            this.logger.log(`Executed ${reason} for Order #${order.id}. P&L: $${order.pnl}`);
        } catch (e) {
            this.logger.error(`Failed to execute ${reason} for Order #${order.id}: ${e.message}`);
        }
    }

    // Check GTD orders that have expired
    private async checkExpiredOrders() {
        const openOrders = await this.orderRepository.find({
            where: { status: 'OPEN', timeInForce: 'GTD' },
        });

        const now = new Date();
        for (const order of openOrders) {
            if (order.expiresAt && new Date(order.expiresAt) <= now) {
                this.logger.log(`GTD Order #${order.id} expired`);
                order.status = 'EXPIRED';
                order.closeReason = 'EXPIRED';
                await this.orderRepository.save(order);

                this.marketGateway.emitTradeAlert(order.userId, {
                    type: 'EXPIRED',
                    orderId: order.id,
                    symbol: order.symbol,
                });
            }
        }
    }
}
