import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOcoDto {
    @ApiProperty({ example: 'BTC', description: 'Asset symbol' })
    @IsString()
    @IsNotEmpty()
    readonly symbol: string;

    @ApiProperty({ example: 0.5, description: 'Amount to trade' })
    @IsNumber()
    @IsPositive()
    readonly amount: number;

    @ApiProperty({ example: 45000, description: 'Stop Loss price' })
    @IsNumber()
    @IsPositive()
    readonly stopLossPrice: number;

    @ApiProperty({ example: 55000, description: 'Take Profit price' })
    @IsNumber()
    @IsPositive()
    readonly takeProfitPrice: number;

    @ApiProperty({ description: 'Broker ID', required: false, example: 'binance' })
    @IsOptional()
    @IsString()
    brokerId?: string;
}
