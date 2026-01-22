import { ApiProperty } from '@nestjs/swagger';
import { CandleEntity } from './candle.entity';

export class CandlePresenter {
    @ApiProperty()
    symbol: string;

    @ApiProperty()
    timeframe: string;

    @ApiProperty()
    timestamp: Date;

    @ApiProperty({ example: 45000.00 })
    open: number;

    @ApiProperty({ example: 46000.00 })
    high: number;

    @ApiProperty({ example: 44000.00 })
    low: number;

    @ApiProperty({ example: 45500.00 })
    close: number;

    @ApiProperty({ example: 100.5 })
    volume: number;

    constructor(candle: CandleEntity) {
        this.symbol = candle.symbol;
        this.timeframe = candle.timeframe;
        this.timestamp = candle.timestamp;
        this.open = candle.open;
        this.high = candle.high;
        this.low = candle.low;
        this.close = candle.close;
        this.volume = candle.volume;
    }
}
