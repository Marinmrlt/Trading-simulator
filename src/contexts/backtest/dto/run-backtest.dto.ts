import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RunBacktestDto {
    @ApiProperty({ example: 'BTC' })
    @IsString({ message: 'Le symbole doit être une chaîne de caractères' })
    symbol: string;

    @ApiProperty({ example: '1h' })
    @IsString({ message: "L'intervalle doit être une chaîne de caractères" })
    timeframe: string;

    @ApiProperty({ example: 1000 })
    @IsNumber({}, { message: 'Le capital initial doit être un nombre' })
    initialCapital: number;

    @ApiProperty({ example: 'SMA_CROSS', description: 'Strategy Name' })
    @IsString({ message: 'Le nom de la stratégie est obligatoire' })
    strategy: string;

    @ApiProperty({ example: { shortPeriod: 9, longPeriod: 21 }, required: false })
    @IsOptional()
    parameters: any;

    @ApiProperty({ example: 100, description: 'Number of candles to look back' })
    @IsNumber({}, { message: 'La limite doit être un nombre' })
    limit: number;

    @ApiProperty({ example: 'binance', required: false })
    @IsString()
    @IsOptional()
    brokerId?: string;
}
