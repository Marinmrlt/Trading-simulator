import { Injectable, Inject } from '@nestjs/common';
import { InvalidOrderError, TradeExecutionError, OrderNotFoundError, OrderNotCancellableError } from '../errors/trade.errors';
import { OrderEntity } from '../../infrastructure/entities/order.entity';
import { CreateOrderDto } from '../../application/dto/create-order.dto';
import { CreateOcoDto } from '../../application/dto/create-oco.dto';
import type { ITradeRepository } from '../ports/trade-repository.port';
import { MarketService } from '../../../market/domain/services/market.service';
import { WalletService } from '../../../wallet/domain/services/wallet.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BrokerService } from './broker.service';
import type { IExchangeAdapter } from '../ports/exchange-adapter.port';
import { MarketGateway } from '../../../market/infrastructure/gateway/market.gateway';
import { RiskService } from './risk.service';

@Injectable()
export class TradeService {
    constructor(
        @Inject('TRADE_REPOSITORY')
        private readonly orderRepository: ITradeRepository,
        private readonly marketService: MarketService,
        private readonly walletService: WalletService,
        private readonly brokerService: BrokerService,
        @Inject('IExchangeAdapter')
        private readonly exchangeAdapter: IExchangeAdapter,
        private readonly marketGateway: MarketGateway,
        private readonly riskService: RiskService,
    ) { }

    public async placeOrder(userId: string, dto: CreateOrderDto): Promise<OrderEntity> {
        // 1. Get Real Price
        const currentPriceAsset = await this.marketService.getPrice(dto.symbol);
        const currentPrice = currentPriceAsset.price;

        const price = dto.type === 'LIMIT' ? dto.price : currentPrice;

        if (!price || price <= 0) {
            throw new InvalidOrderError(`Price must be positive for ${dto.type} order`);
        }

        // 2. Validate SL/TP if provided
        if (dto.stopLoss) {
            if (dto.side === 'BUY' && dto.stopLoss >= price) {
                throw new InvalidOrderError('Stop Loss must be below entry price for BUY orders');
            }
            if (dto.side === 'SELL' && dto.stopLoss <= price) {
                throw new InvalidOrderError('Stop Loss must be above entry price for SELL orders');
            }
        }
        if (dto.takeProfit) {
            if (dto.side === 'BUY' && dto.takeProfit <= price) {
                throw new InvalidOrderError('Take Profit must be above entry price for BUY orders');
            }
            if (dto.side === 'SELL' && dto.takeProfit >= price) {
                throw new InvalidOrderError('Take Profit must be below entry price for SELL orders');
            }
        }

        // 3. Validate GTD expiry
        const timeInForce = dto.timeInForce || 'GTC';
        if (timeInForce === 'GTD' && !dto.expiresAt) {
            throw new InvalidOrderError('expiresAt is required for GTD orders');
        }

        // 4. Risk checks
        const total = dto.amount * price;
        await this.riskService.checkPositionSize(userId, total);
        await this.riskService.checkDailyLoss(userId);

        // 5. Lock Funds
        if (dto.side === 'BUY') {
            await this.walletService.lockFunds(userId, 'USD', total);
        } else {
            await this.walletService.lockFunds(userId, dto.symbol, dto.amount);
        }

        // 5. Create Order
        const order = await this.orderRepository.create({
            userId,
            symbol: dto.symbol,
            amount: dto.amount,
            side: dto.side,
            price,
            status: dto.type === 'LIMIT' ? 'OPEN' : 'FILLED',
            type: dto.type || 'MARKET',
            stopLoss: dto.stopLoss,
            takeProfit: dto.takeProfit,
            brokerId: dto.brokerId || 'binance',
            timeInForce,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            trailingStopPercent: dto.trailingStopPercent,
            highestPrice: dto.trailingStopPercent ? price : undefined,
        });

        // 6. Save Order
        await this.orderRepository.save(order);

        // 7. Execute immediately if MARKET
        if (order.type === 'MARKET') {
            return this.executeOrder(order, currentPrice);
        }

        // 8. IOC: If LIMIT order not immediately fillable, cancel it
        if (timeInForce === 'IOC') {
            const canFill =
                (order.side === 'BUY' && currentPrice <= price) ||
                (order.side === 'SELL' && currentPrice >= price);

            if (canFill) {
                return this.executeOrder(order, currentPrice);
            } else {
                await this.exchangeAdapter.cancelOrder(order);
                order.status = 'CANCELLED';
                return this.orderRepository.save(order);
            }
        }

        // LIMIT order stays OPEN and Locked (GTC or GTD)
        return order;
    }

    // Shared execution logic (Market Order OR Triggered Limit Order)
    private async executeOrder(order: OrderEntity, executionPrice: number): Promise<OrderEntity> {
        const originalLockedPrice = order.price;
        order.price = executionPrice;

        try {
            const executedOrder = await this.exchangeAdapter.executeOrder(order);

            // Unlock excess locked funds for limit orders filled at better price
            if (order.type === 'LIMIT' && order.side === 'BUY') {
                const lockedAmount = order.amount * originalLockedPrice;
                const executedAmount = order.amount * executionPrice;
                const excess = lockedAmount - executedAmount;
                if (excess > 0) {
                    await this.walletService.unlockFunds(order.userId, 'USD', excess);
                }
            }

            executedOrder.filledAmount = executedOrder.amount;

            const saved = await this.orderRepository.save(executedOrder);

            // WebSocket notification
            this.marketGateway.emitOrderUpdate(order.userId, {
                orderId: saved.id,
                status: saved.status,
                symbol: saved.symbol,
                side: saved.side,
                price: executionPrice,
                amount: saved.amount,
                type: 'ORDER_FILLED',
            });

            return saved;
        } catch (error) {
            throw new TradeExecutionError(error.message);
        }
    }

    // Get all orders for a user
    public async getOrders(userId: string): Promise<OrderEntity[]> {
        return this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }

    // Cancel an open order
    public async cancelOrder(userId: string, orderId: string): Promise<OrderEntity> {
        const orders = await this.orderRepository.find({ where: { id: orderId, userId } });
        const order = orders[0];

        if (!order) {
            throw new OrderNotFoundError(orderId);
        }

        if (order.status !== 'OPEN') {
            throw new OrderNotCancellableError(orderId, order.status);
        }

        await this.exchangeAdapter.cancelOrder(order);

        order.status = 'CANCELLED';
        return this.orderRepository.save(order);
    }

    // Get open positions for a user (FILLED BUY orders without closeReason)
    public async getOpenPositions(userId: string): Promise<OrderEntity[]> {
        const allPositions = await this.orderRepository.findOpenPositions();
        return allPositions.filter(p => p.userId === userId);
    }

    // OCO: Place two linked orders (SL + TP) that cancel each other
    public async placeOCO(userId: string, dto: CreateOcoDto): Promise<{ stopLossOrder: OrderEntity; takeProfitOrder: OrderEntity }> {
        // Get current price
        const currentPriceAsset = await this.marketService.getPrice(dto.symbol);
        const currentPrice = currentPriceAsset.price;

        // Validate SL/TP against current price
        if (dto.stopLossPrice >= currentPrice) {
            throw new InvalidOrderError('Stop Loss must be below current price');
        }
        if (dto.takeProfitPrice <= currentPrice) {
            throw new InvalidOrderError('Take Profit must be above current price');
        }

        const brokerId = dto.brokerId || 'binance';

        // Create SL order
        const slOrder = this.orderRepository.create({
            userId,
            symbol: dto.symbol,
            amount: dto.amount,
            side: 'SELL',
            price: dto.stopLossPrice,
            status: 'OPEN',
            type: 'LIMIT',
            stopLoss: dto.stopLossPrice,
            brokerId,
            timeInForce: 'GTC',
        });
        const savedSl = await this.orderRepository.save(slOrder);

        // Create TP order
        const tpOrder = this.orderRepository.create({
            userId,
            symbol: dto.symbol,
            amount: dto.amount,
            side: 'SELL',
            price: dto.takeProfitPrice,
            status: 'OPEN',
            type: 'LIMIT',
            takeProfit: dto.takeProfitPrice,
            brokerId,
            timeInForce: 'GTC',
        });
        const savedTp = await this.orderRepository.save(tpOrder);

        // Cross-link them
        savedSl.linkedOrderId = savedTp.id;
        savedTp.linkedOrderId = savedSl.id;
        await this.orderRepository.save(savedSl);
        await this.orderRepository.save(savedTp);

        return { stopLossOrder: savedSl, takeProfitOrder: savedTp };
    }

    // Performance dashboard
    public async getPerformance(userId: string) {
        const orders = await this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
        const closedTrades = orders.filter(o => o.closeReason && o.pnl !== null && o.pnl !== undefined);

        if (closedTrades.length === 0) {
            return {
                totalTrades: orders.length,
                closedTrades: 0,
                winRate: '0%',
                totalPnl: 0,
                avgPnl: 0,
                bestTrade: 0,
                worstTrade: 0,
                sharpeRatio: 0,
            };
        }

        const wins = closedTrades.filter(t => t.pnl > 0);
        const pnls = closedTrades.map(t => t.pnl);
        const totalPnl = pnls.reduce((s, v) => s + v, 0);
        const avgPnl = totalPnl / pnls.length;

        // Sharpe ratio (simplified: avg / stddev)
        const variance = pnls.reduce((s, v) => s + Math.pow(v - avgPnl, 2), 0) / pnls.length;
        const stddev = Math.sqrt(variance);
        const sharpe = stddev > 0 ? avgPnl / stddev : 0;

        return {
            totalTrades: orders.length,
            closedTrades: closedTrades.length,
            winRate: ((wins.length / closedTrades.length) * 100).toFixed(1) + '%',
            totalPnl: Math.round(totalPnl * 100) / 100,
            avgPnl: Math.round(avgPnl * 100) / 100,
            bestTrade: Math.round(Math.max(...pnls) * 100) / 100,
            worstTrade: Math.round(Math.min(...pnls) * 100) / 100,
            sharpeRatio: Math.round(sharpe * 100) / 100,
        };
    }

    // Leaderboard — public
    public async getLeaderboard() {
        const allOrders = await this.orderRepository.find({});
        const closedTrades = allOrders.filter(o => o.closeReason && o.pnl !== null && o.pnl !== undefined);

        const userPnl: Record<string, { totalPnl: number; trades: number }> = {};
        for (const t of closedTrades) {
            if (!userPnl[t.userId]) {
                userPnl[t.userId] = { totalPnl: 0, trades: 0 };
            }
            userPnl[t.userId].totalPnl += t.pnl;
            userPnl[t.userId].trades++;
        }

        return Object.entries(userPnl)
            .map(([userId, data]) => ({
                userId,
                totalPnl: Math.round(data.totalPnl * 100) / 100,
                trades: data.trades,
            }))
            .sort((a, b) => b.totalPnl - a.totalPnl)
            .slice(0, 50);
    }

    @OnEvent('price.update')
    async handlePriceUpdate(payload: { symbol: string, price: number }) {
        const { symbol, price } = payload;

        const openOrders = await this.orderRepository.find({ where: { symbol, status: 'OPEN', type: 'LIMIT' } });

        for (const order of openOrders) {
            if (order.side === 'BUY' && price <= order.price) {
                await this.executeOrder(order, price);
            } else if (order.side === 'SELL' && price >= order.price) {
                await this.executeOrder(order, price);
            }
        }
    }
}
