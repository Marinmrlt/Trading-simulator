import { ApiProperty } from '@nestjs/swagger';
import { WalletEntity } from './wallet.entity';

export class WalletPresenter {
    @ApiProperty()
    id: string;

    @ApiProperty({ example: 'USD' })
    currency: string;

    @ApiProperty({ example: 1000.50 })
    balance: number;

    @ApiProperty({ example: 0 })
    locked: number;

    @ApiProperty({ example: 1000.50 })
    available: number;

    @ApiProperty({ example: '1000.50 USD' })
    formattedBalance: string;

    constructor(wallet: WalletEntity) {
        this.id = wallet.id;
        this.currency = wallet.currency;
        this.balance = wallet.balance;
        this.locked = wallet.locked;
        this.available = wallet.balance - wallet.locked;
        this.formattedBalance = `${wallet.balance.toFixed(2)} ${wallet.currency}`;
    }
}
