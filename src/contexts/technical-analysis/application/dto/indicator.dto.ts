import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class BaseIndicatorDto {
    @ApiProperty({ example: 'BTC' })
    @IsString()
    @IsNotEmpty()
    symbol: string;

    @ApiPropertyOptional({ example: '1h', default: '1h' })
    @IsString()
    @IsOptional()
    timeframe?: string = '1h';
}

export class PeriodIndicatorDto extends BaseIndicatorDto {
    @ApiPropertyOptional({ example: 14, default: 14 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    period?: number = 14;
}

export class BollingerDto extends PeriodIndicatorDto {
    @ApiPropertyOptional({ example: 2, default: 2 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    stdDev?: number = 2;
}
