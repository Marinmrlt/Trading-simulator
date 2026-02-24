import { ApiProperty } from '@nestjs/swagger';

export class BacktestResultPresenter {
    @ApiProperty()
    strategy: string;

    @ApiProperty()
    broker: string;

    @ApiProperty()
    initialCapital: number;

    @ApiProperty()
    finalEquity: number;

    @ApiProperty()
    totalFees: number;

    @ApiProperty()
    totalReturn: string;

    @ApiProperty()
    tradesCount: number;

    @ApiProperty({ description: 'Advanced metrics object', type: Object })
    metrics: any;

    @ApiProperty({ description: 'List of trades', type: [Object] })
    trades: any[];

    @ApiProperty({ description: 'Equity curve points', type: [Object] })
    equityCurve: any[];

    @ApiProperty({ description: 'Drawdown curve points', type: [Object] })
    drawdownCurve: any[];

    constructor(data: Partial<BacktestResultPresenter>) {
        Object.assign(this, data);
    }
}
