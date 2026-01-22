import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 'BTC', description: 'Asset symbol' })
    @IsString()
    @IsNotEmpty()
    readonly symbol: string;

    @ApiProperty({ example: 0.5, description: 'Amount to trade' })
    @IsNumber()
    @IsPositive()
    readonly amount: number;

    @ApiProperty({ enum: ['BUY', 'SELL'], example: 'BUY', description: 'Order direction' })
    @IsEnum(['BUY', 'SELL'])
    side: 'BUY' | 'SELL';

    @ApiProperty({ enum: ['MARKET', 'LIMIT'], example: 'MARKET', description: 'Order type', required: false })
    @IsOptional()
    @IsEnum(['MARKET', 'LIMIT'])
    type?: 'MARKET' | 'LIMIT';

    @ApiProperty({ description: 'Stop Loss Price', required: false, example: 45000 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    stopLoss?: number;

    @ApiProperty({ description: 'Take Profit Price', required: false, example: 55000 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    takeProfit?: number;
}
