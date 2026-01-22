import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { OrderEntity } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import type { ITradeRepository } from './interfaces/trade.repository.interface';
import { MarketService } from '../market/market.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class TradeService {
    constructor(
        @Inject('TRADE_REPOSITORY')
        private readonly orderRepository: ITradeRepository,
        private readonly marketService: MarketService,
        private readonly walletService: WalletService,
    ) { }

    public async placeOrder(userId: string, dto: CreateOrderDto): Promise<OrderEntity> {
        // 1. Get Real Price
        const asset = await this.marketService.getPrice(dto.symbol);
        if (!asset) {
            throw new BadRequestException('Invalid symbol');
        }
        const price = asset.price;
        const total = dto.amount * price;

        // 2. Buy Logic (Market Order)
        if (dto.side === 'BUY') {
            // Lock USD
            await this.walletService.lockFunds(userId, 'USD', total);

            // Create Order
            const order = await this.orderRepository.create({
                ...dto,
                userId,
                price,
                status: 'FILLED',
                stopLoss: dto.stopLoss,
                takeProfit: dto.takeProfit
            });
            await this.orderRepository.save(order);

            // Deduct USD (Spend)
            await this.walletService.deductFunds(userId, 'USD', total);

            // Add Asset (Receive)
            await this.walletService.addFunds(userId, dto.symbol, dto.amount);

            return order;
        }

        // 3. Sell Logic
        if (dto.side === 'SELL') {
            // Lock Asset
            await this.walletService.lockFunds(userId, dto.symbol, dto.amount);

            const order = await this.orderRepository.create({
                ...dto,
                userId,
                price,
                status: 'FILLED',
                stopLoss: dto.stopLoss,
                takeProfit: dto.takeProfit
            });
            await this.orderRepository.save(order);

            // Deduct Asset (Spend)
            await this.walletService.deductFunds(userId, dto.symbol, dto.amount);

            // Add USD (Receive)
            await this.walletService.addFunds(userId, 'USD', total);

            return order;
        }

        throw new BadRequestException('Invalid order side');
    }
}
