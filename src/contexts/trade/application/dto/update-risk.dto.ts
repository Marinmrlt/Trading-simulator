import { IsOptional, IsNumber, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRiskDto {
    @ApiProperty({ description: 'Max single position size as % of portfolio', required: false, example: 25 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    maxPositionSizePercent?: number;

    @ApiProperty({ description: 'Max daily realized loss in USD', required: false, example: 1000 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    dailyLossLimit?: number;
}
