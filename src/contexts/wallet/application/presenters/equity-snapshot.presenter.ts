import { ApiProperty } from '@nestjs/swagger';
import { EquitySnapshotEntity } from '../../infrastructure/entities/equity-snapshot.entity';

export class EquitySnapshotPresenter {
    @ApiProperty()
    id: string;

    @ApiProperty()
    totalValueUSD: number;

    @ApiProperty()
    timestamp: Date;

    constructor(entity: EquitySnapshotEntity) {
        this.id = entity.id;
        this.totalValueUSD = entity.totalValueUSD;
        this.timestamp = entity.timestamp;
    }
}
