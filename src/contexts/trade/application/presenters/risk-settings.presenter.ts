import { ApiProperty } from '@nestjs/swagger';
import { RiskEntity } from '../../infrastructure/entities/risk.entity';

export class RiskSettingsPresenter {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    maxPositionSizePercent: number;

    @ApiProperty()
    dailyLossLimit: number;

    @ApiProperty()
    dailyLossUsed: number;

    @ApiProperty()
    lastResetDate: Date;

    constructor(entity: RiskEntity) {
        this.userId = entity.userId;
        this.maxPositionSizePercent = entity.maxPositionSizePercent;
        this.dailyLossLimit = entity.dailyLossLimit;
        this.dailyLossUsed = entity.dailyLossUsed;
        this.lastResetDate = entity.lastResetDate;
    }
}
