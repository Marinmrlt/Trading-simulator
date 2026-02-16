import { Injectable } from '@nestjs/common';
import { IStrategy } from './strategy.interface';
import { SmaCrossStrategy } from './sma-cross.strategy';
import { RsiStrategy } from './rsi.strategy';
import { MacdStrategy } from './macd.strategy';

@Injectable()
export class StrategyRegistry {
    private strategies: Map<string, IStrategy> = new Map();

    constructor() {
        this.register(new SmaCrossStrategy());
        this.register(new RsiStrategy());
        this.register(new MacdStrategy());
    }

    register(strategy: IStrategy) {
        this.strategies.set(strategy.name, strategy);
    }

    get(name: string): IStrategy {
        const strategy = this.strategies.get(name);
        if (!strategy) {
            throw new Error(`Strategy ${name} not found`);
        }
        // Return a fresh instance? Or reuse?
        // Reuse is fine if we re-prepare. But simpler to return NEW instance if stateful.
        // SmaCrossStrategy is stateful (this.smaShort, etc).
        // So we should probably use a Factory Pattern or Prototype.
        // For simplicity: Clone or strict instantiation?
        // Let's just return the instance but beware of concurrency if multiple requests hit same instance.
        // Node is single threaded but async. If 'prepare' modifies state, concurrent backtests will clash.
        // SOLUTION: Registry returns "Constructors" or "Factories".
        // Or simpler: just import classes manually in Service for now?
        // Let's make Registry return a fresh instance.

        if (name === 'SMA_CROSS') return new SmaCrossStrategy();
        if (name === 'RSI') return new RsiStrategy();
        if (name === 'MACD') return new MacdStrategy();

        throw new Error(`Strategy ${name} not implemented in factory`);
    }

    getAvailableStrategies(): string[] {
        return Array.from(this.strategies.keys());
    }
}
