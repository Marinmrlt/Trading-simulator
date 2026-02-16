import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCandlesDto {
    @ApiProperty({ example: 'BTC', description: 'Asset symbol' })
    @IsString()
    @IsNotEmpty({ message: 'Le symbole est obligatoire' })
    symbol: string;

    @ApiProperty({ example: '1h', enum: ['1m', '1h', '1d', '1w'], description: 'Timeframe for candles' })
    @IsEnum(['1m', '1h', '1d', '1w'], { message: "L'intervalle doit être 1m, 1h, 1d ou 1w" })
    timeframe: string;
}
