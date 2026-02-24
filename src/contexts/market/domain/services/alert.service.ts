import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { AlertEntity } from '../../infrastructure/entities/alert.entity';
import { MarketGateway } from '../../infrastructure/gateway/market.gateway';

@Injectable()
export class AlertService {
    private readonly logger = new Logger(AlertService.name);

    constructor(
        @InjectRepository(AlertEntity)
        private readonly alertRepo: Repository<AlertEntity>,
        private readonly marketGateway: MarketGateway,
    ) { }

    public async createAlert(userId: string, dto: { symbol: string; condition: 'ABOVE' | 'BELOW'; targetPrice: number }): Promise<AlertEntity> {
        const alert = this.alertRepo.create({
            userId,
            symbol: dto.symbol,
            condition: dto.condition,
            targetPrice: dto.targetPrice,
            triggered: false,
        });
        return this.alertRepo.save(alert);
    }

    public async getAlerts(userId: string): Promise<AlertEntity[]> {
        return this.alertRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    public async deleteAlert(userId: string, alertId: string): Promise<void> {
        await this.alertRepo.delete({ id: alertId, userId });
    }

    // Listen to price updates and check all active alerts
    @OnEvent('price.update')
    async onPriceUpdate(payload: { symbol: string; price: number }) {
        const alerts = await this.alertRepo.find({
            where: { symbol: payload.symbol, triggered: false },
        });

        for (const alert of alerts) {
            const shouldTrigger =
                (alert.condition === 'ABOVE' && payload.price >= alert.targetPrice) ||
                (alert.condition === 'BELOW' && payload.price <= alert.targetPrice);

            if (shouldTrigger) {
                alert.triggered = true;
                await this.alertRepo.save(alert);

                // WebSocket notification
                this.marketGateway.emitTradeAlert(alert.userId, {
                    type: 'PRICE_ALERT',
                    symbol: alert.symbol,
                    condition: alert.condition,
                    targetPrice: alert.targetPrice,
                    currentPrice: payload.price,
                    alertId: alert.id,
                });

                this.logger.log(
                    `Price alert triggered: ${alert.symbol} ${alert.condition} $${alert.targetPrice} (current: $${payload.price})`
                );
            }
        }
    }
}
