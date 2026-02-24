import { Injectable, Logger, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { MarketService } from '../../../market/domain/services/market.service';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import type { ITradeRepository } from '../ports/trade-repository.port';
import { TradeService } from './trade.service';
import { MarketGateway } from '../../../market/infrastructure/gateway/market.gateway';

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

        // --- Trailing Stop: update highest price & check trigger ---
        if (order.trailingStopPercent) {
            const prev = order.highestPrice || order.price;
            if (currentPrice > prev) {
                order.highestPrice = currentPrice;
                await this.orderRepository.save(order);
            }

            const peak = order.highestPrice || order.price;
            const triggerPrice = peak * (1 - order.trailingStopPercent / 100);

            if (currentPrice <= triggerPrice) {
                await this.executeTrigger(order, currentPrice, 'TRAILING_STOP');
                return;
            }
        }

        // --- Fixed Stop Loss ---
        if (order.stopLoss && currentPrice <= order.stopLoss) {
            await this.executeTrigger(order, currentPrice, 'STOP_LOSS');
            return;
        }

        // --- Take Profit ---
        if (order.takeProfit && currentPrice >= order.takeProfit) {
            await this.executeTrigger(order, currentPrice, 'TAKE_PROFIT');
            return;
        }
    }

    private async executeTrigger(
        order: OrderEntity,
        price: number,
        reason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP',
    ) {
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

            // --- OCO: cancel linked order ---
            if (order.linkedOrderId) {
                await this.cancelLinkedOrder(order.linkedOrderId);
            }

            // WebSocket alert
            this.marketGateway.emitTradeAlert(order.userId, {
                type: reason,
                orderId: order.id,
                symbol: order.symbol,
                entryPrice: order.price,
                exitPrice: price,
                pnl: order.pnl,
                amount: order.amount,
                trailingStopPercent: order.trailingStopPercent,
                highestPrice: order.highestPrice,
            });

            this.logger.log(`Executed ${reason} for Order #${order.id}. P&L: $${order.pnl}`);
        } catch (e) {
            this.logger.error(`Failed to execute ${reason} for Order #${order.id}: ${e.message}`);
        }
    }

    // Cancel a linked OCO order
    private async cancelLinkedOrder(linkedOrderId: string) {
        try {
            const linked = await this.orderRepository.find({ where: { id: linkedOrderId } });
            if (linked[0] && !linked[0].closeReason) {
                linked[0].status = 'CANCELLED';
                linked[0].closeReason = 'OCO_CANCELLED';
                await this.orderRepository.save(linked[0]);
                this.logger.log(`OCO: Cancelled linked Order #${linkedOrderId}`);
            }
        } catch (e) {
            this.logger.error(`OCO: Failed to cancel linked Order #${linkedOrderId}: ${e.message}`);
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
