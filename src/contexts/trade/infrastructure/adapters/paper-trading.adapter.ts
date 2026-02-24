import { Injectable } from '@nestjs/common';
import { IExchangeAdapter } from '../../domain/ports/exchange-adapter.port';
import { OrderEntity } from '../entities/order.entity';
import { WalletService } from '../../../wallet/domain/services/wallet.service';
import { BrokerService } from '../../domain/services/broker.service';

@Injectable()
export class PaperTradingAdapter implements IExchangeAdapter {
    constructor(
        private readonly walletService: WalletService,
        private readonly brokerService: BrokerService,
    ) { }

    async executeOrder(order: OrderEntity): Promise<OrderEntity> {
        // Apply simulated slippage: ±0.1% random deviation
        const slippageFactor = 1 + (Math.random() * 0.002 - 0.001);
        const executionPrice = Math.round(order.price * slippageFactor * 100) / 100;
        const total = order.amount * executionPrice;
        const brokerId = order.brokerId || 'binance';

        if (order.side === 'BUY') {
            // Already Locked USD. Deduct cost.
            await this.walletService.deductFunds(order.userId, 'USD', total);

            // Calculate Fee
            const feeValue = this.brokerService.calculateFee(order.amount, executionPrice, 'TAKER', brokerId);

            // Buy: Receive Asset. (total - fee) / price
            const netUsd = total - feeValue;
            let netAmount = netUsd / executionPrice;
            if (netAmount < 0) netAmount = 0;

            await this.walletService.addFunds(order.userId, order.symbol, netAmount);

            // Log trade transaction
            await this.walletService.logTradeTransaction(order.userId, 'BUY', order.amount, order.symbol, executionPrice);

            order.fee = feeValue;
            order.feeAsset = 'USD';
        } else {
            // SELL: Locked Asset. Deduct Asset.
            await this.walletService.deductFunds(order.userId, order.symbol, order.amount);

            // Receive USD
            const feeValue = this.brokerService.calculateFee(order.amount, executionPrice, 'TAKER', brokerId);
            const netTotal = total - feeValue;

            await this.walletService.addFunds(order.userId, 'USD', netTotal > 0 ? netTotal : 0);

            // Log trade transaction
            await this.walletService.logTradeTransaction(order.userId, 'SELL', order.amount, order.symbol, executionPrice);

            order.fee = feeValue;
            order.feeAsset = 'USD';
        }

        order.status = 'FILLED';
        return order;
    }

    async cancelOrder(order: OrderEntity): Promise<boolean> {
        // Unlock the funds that were locked when the order was placed
        if (order.side === 'BUY') {
            const total = order.amount * order.price;
            await this.walletService.unlockFunds(order.userId, 'USD', total);
        } else {
            await this.walletService.unlockFunds(order.userId, order.symbol, order.amount);
        }
        return true;
    }

    async getBalance(asset: string): Promise<number> {
        // This would require context of WHICH user. 
        // The interface might need userId if we want to fetch balance.
        // For now, we skip as TradeService uses WalletService directly for checks.
        return 0;
    }
}
