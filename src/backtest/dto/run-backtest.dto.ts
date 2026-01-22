import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RunBacktestDto {
    @ApiProperty({ example: 'BTC' })
    @IsString()
    symbol: string;

    @ApiProperty({ example: '1h' })
    @IsString()
    timeframe: string;

    @ApiProperty({ example: 1000 })
    @IsNumber()
    initialCapital: number;

    @ApiProperty({ example: 'SMA_CROSS', description: 'Strategy Name' })
    @IsString()
    strategy: string;

    @ApiProperty({ example: { shortPeriod: 9, longPeriod: 21 }, required: false })
    @IsOptional()
    parameters: any;

    @ApiProperty({ example: 100, description: 'Number of candles to look back' })
    @IsNumber()
    limit: number;
}
