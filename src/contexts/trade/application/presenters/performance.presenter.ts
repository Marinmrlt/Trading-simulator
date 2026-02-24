import { ApiProperty } from '@nestjs/swagger';

export class PerformancePresenter {
    @ApiProperty()
    totalTrades: number;

    @ApiProperty()
    closedTrades: number;

    @ApiProperty()
    winRate: string;

    @ApiProperty()
    totalPnl: number;

    @ApiProperty()
    avgPnl: number;

    @ApiProperty()
    bestTrade: number;

    @ApiProperty()
    worstTrade: number;

    @ApiProperty()
    sharpeRatio: number;

    constructor(data: Partial<PerformancePresenter>) {
        Object.assign(this, data);
    }
}
