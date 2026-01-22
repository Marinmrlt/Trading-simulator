import { Injectable, Logger, Inject } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { MarketService } from '../market/market.service';
import { OrderEntity } from './order.entity';
import type { ITradeRepository } from './interfaces/trade.repository.interface';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TradeMonitorService {
    private readonly logger = new Logger(TradeMonitorService.name);

    constructor(
        @Inject('TRADE_REPOSITORY')
        private readonly orderRepository: ITradeRepository,
        private readonly marketService: MarketService,
        private readonly walletService: WalletService,
    ) { }

    @Interval(1000) // Run every second
    async checkOrders() {
        // 1. Get all OPEN orders that have SL or TP
        const openOrders = await this.orderRepository.findAllByStatus('FILLED');
        // Note: In our current logic, 'FILLED' means active position for Spot Market if we consider them "Holding".
        // BUT wait, a Spot BUY is instantly settled. The user holds the Asset.
        // Stop Loss on Spot means "If I hold BTC and price drops, SELL it".
        // So we need to look for 'Active Positions' or we might need a separate 'Trigger Order' table?
        // For simplicity in this simulator: assume we track "Positions" or we treat FILLED Buy orders as holding until sold?
        // Actually, usually SL/TP are attached to a Position or are "Pending Orders".
        // Let's assume for this MVP: We scan user wallets or we introduce a simplified "Position" concept?
        // OR: Simpler: The user places a "Limit Sell" (TP) or "Stop Sell" (SL).
        // Let's stick to the prompt: We added SL/TP columns to the Order.
        // If we treat the Order as the "Trade Context", we can monitor it.
        // BUT if it's FILLED, it's done. 
        // Refinement: We should probably keep the order 'OPEN' if it's a Limit order, OR if it's a "Smart Trade" wrapper.
        // Given the code: 'FILLED' means "money spent, asset received". 
        // The SL/TP should conceptually create NEW pending orders to SELL if conditions met.

        // Let's implement: Active Monitoring of "Smart Trades".
        // We iterate orders that were FILLED (Bought) but not yet "Closed" by a Sell?
        // This requires tracking "Open Positions". 
        // MVP Shortcut: We scan ALL 'FILLED' BUY orders that don't have a 'closeReason'.
        // If Price hits SL/TP, we execute a MARKET SELL and mark this order as "Closed/Settled".

        // Let's fetch Orders where side=BUY and closeReason is NULL.
        // Realistically efficient? No. MVP? Yes.

        const positions = await this.orderRepository.findOpenPositions(); // Need to add this method to Repo interface ideally
        // Since we can't easily change Repo Interface right now without strict implementation, 
        // let's just fetch all and filter in memory (inefficient but works for small simulator).

        if (!positions || positions.length === 0) return;

        for (const order of positions) {
            await this.checkSingleOrder(order);
        }
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
            // 1. Execute Sell Logic
            // We need to SELL the amount acquired in the original order.
            // Check wallet balance first? (User might have sold it manually).
            const wallet = await this.walletService.getWallet(order.userId, order.symbol);
            if (!wallet || wallet.balance < order.amount) {
                this.logger.warn(`Cannot execute ${reason}: Insufficient balance (Manually sold?)`);
                return;
            }

            // Lock Asset
            await this.walletService.lockFunds(order.userId, order.symbol, order.amount);

            // Create Sell Order
            const total = order.amount * price;

            // We use TradeService to place a SELL order? 
            // Better to perform the logic directly to link it to the closeReason.

            // Deduct Asset
            await this.walletService.deductFunds(order.userId, order.symbol, order.amount);

            // Add USD
            await this.walletService.addFunds(order.userId, 'USD', total);

            // Update Original Order to mark as closed
            order.closeReason = reason;
            await this.orderRepository.save(order);

            this.logger.log(`Executed ${reason} Success. Sold ${order.amount} ${order.symbol} for ${total} USD`);

        } catch (e) {
            this.logger.error(`Failed to execute trigger: ${e.message}`);
        }
    }
}
