import { Injectable } from '@nestjs/common';
import { BrokerConfig } from '../models/broker.config';

@Injectable()
export class BrokerService {
    private readonly brokers: BrokerConfig[] = [
        {
            id: 'binance',
            name: 'Binance',
            feeType: 'PERCENTAGE',
            makerFee: 0.001, // 0.1%
            takerFee: 0.001, // 0.1%
        },
        {
            id: 'kraken',
            name: 'Kraken',
            feeType: 'PERCENTAGE',
            makerFee: 0.0016, // 0.16%
            takerFee: 0.0026, // 0.26%
        },
        {
            id: 'coinbase',
            name: 'Coinbase Pro',
            feeType: 'PERCENTAGE',
            makerFee: 0.004, // 0.4%
            takerFee: 0.006, // 0.6%
        },
        {
            id: 'fixed_example',
            name: 'Fixed Fee Broker',
            feeType: 'FIXED',
            makerFee: 1.0, // $1
            takerFee: 2.0, // $2
        }
    ];

    getBrokers(): BrokerConfig[] {
        return this.brokers;
    }

    getBroker(id: string): BrokerConfig | undefined {
        return this.brokers.find(b => b.id === id);
    }

    calculateFee(amount: number, price: number, type: 'MAKER' | 'TAKER', brokerId: string = 'binance'): number {
        const broker = this.getBroker(brokerId);
        if (!broker) return 0;

        const feeRate = type === 'MAKER' ? broker.makerFee : broker.takerFee;

        if (broker.feeType === 'FIXED') {
            return feeRate;
        }

        // Percentage: fee based on total volume (amount * price for quote asset, or amount for base asset)
        // Usually fees are deducted from the RECEIVED asset.
        // But for calculation magnitude, it's % of volume.
        return amount * price * feeRate;
    }
}
