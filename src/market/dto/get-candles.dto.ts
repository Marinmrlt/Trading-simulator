import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCandlesDto {
    @ApiProperty({ example: 'BTC', description: 'Asset symbol' })
    @IsString()
    @IsNotEmpty()
    symbol: string;

    @ApiProperty({ example: '1h', enum: ['1m', '1h', '1d', '1w'], description: 'Timeframe for candles' })
    @IsEnum(['1m', '1h', '1d', '1w'])
    timeframe: string;
}
