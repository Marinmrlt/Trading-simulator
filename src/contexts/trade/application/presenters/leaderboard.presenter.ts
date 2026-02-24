import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryPresenter {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    totalPnl: number;

    @ApiProperty()
    trades: number;

    constructor(data: Partial<LeaderboardEntryPresenter>) {
        Object.assign(this, data);
    }
}
