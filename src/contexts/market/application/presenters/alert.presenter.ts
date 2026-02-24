import { ApiProperty } from '@nestjs/swagger';
import { AlertEntity } from '../../infrastructure/entities/alert.entity';

export class AlertPresenter {
    @ApiProperty()
    id: string;

    @ApiProperty()
    symbol: string;

    @ApiProperty({ enum: ['ABOVE', 'BELOW'] })
    condition: 'ABOVE' | 'BELOW';

    @ApiProperty()
    targetPrice: number;

    @ApiProperty()
    triggered: boolean;

    @ApiProperty()
    createdAt: Date;

    constructor(entity: AlertEntity) {
        this.id = entity.id;
        this.symbol = entity.symbol;
        this.condition = entity.condition;
        this.targetPrice = entity.targetPrice;
        this.triggered = entity.triggered;
        this.createdAt = entity.createdAt;
    }
}
