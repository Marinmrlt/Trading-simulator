import { ApiProperty } from '@nestjs/swagger';
import { TransactionEntity, TransactionType } from './transaction.entity';

export class TransactionPresenter {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: TransactionType })
    type: TransactionType;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    currency: string;

    @ApiProperty({ required: false })
    price?: number;

    @ApiProperty()
    timestamp: Date;

    constructor(t: TransactionEntity) {
        this.id = t.id;
        this.type = t.type;
        this.amount = t.amount;
        this.currency = t.currency;
        this.price = t.price;
        this.timestamp = t.timestamp;
    }
}
