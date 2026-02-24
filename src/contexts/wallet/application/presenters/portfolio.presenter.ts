import { ApiProperty } from '@nestjs/swagger';

export class WalletSummaryPresenter {
    @ApiProperty()
    currency: string;

    @ApiProperty()
    balance: number;

    @ApiProperty()
    locked: number;

    @ApiProperty()
    available: number;

    @ApiProperty()
    valueUSD: number;
}

export class PortfolioPresenter {
    @ApiProperty({ type: [WalletSummaryPresenter] })
    wallets: WalletSummaryPresenter[];

    @ApiProperty()
    totalValueUSD: number;

    constructor(data: Partial<PortfolioPresenter>) {
        Object.assign(this, data);
    }
}
