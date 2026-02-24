import { ApiProperty } from '@nestjs/swagger';

export class ComparisonResultPresenter {
    @ApiProperty()
    broker: string;

    @ApiProperty()
    finalEquity: number;

    @ApiProperty()
    totalReturn: string;

    @ApiProperty()
    tradesCount: number;

    constructor(data: Partial<ComparisonResultPresenter>) {
        Object.assign(this, data);
    }
}
