import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({ example: 'BTC', description: 'Asset symbol' })
    @IsString()
    @IsNotEmpty({ message: 'Le symbole est obligatoire' })
    readonly symbol: string;

    @ApiProperty({ example: 0.5, description: 'Amount to trade' })
    @IsNumber({}, { message: 'Le montant doit être un nombre' })
    @IsPositive({ message: 'Le montant doit être positif' })
    readonly amount: number;

    @ApiProperty({ enum: ['BUY', 'SELL'], example: 'BUY', description: 'Order direction' })
    @IsEnum(['BUY', 'SELL'], { message: "Le sens de l'ordre doit être BUY ou SELL" })
    side: 'BUY' | 'SELL';

    @ApiProperty({ enum: ['MARKET', 'LIMIT'], example: 'MARKET', description: 'Order type', required: false })
    @IsOptional()
    @IsEnum(['MARKET', 'LIMIT'])
    type?: 'MARKET' | 'LIMIT';

    @ApiProperty({ description: 'Stop Loss Price', required: false, example: 45000 })
    @IsOptional()
    @IsNumber({}, { message: 'Le Stop Loss doit être un nombre' })
    @IsPositive({ message: 'Le Stop Loss doit être positif' })
    stopLoss?: number;

    @ApiProperty({ description: 'Limit Price (Required for LIMIT orders)', required: false, example: 50000 })
    @IsOptional()
    @IsNumber({}, { message: 'Le prix limite doit être un nombre' })
    @IsPositive({ message: 'Le prix limite doit être positif' })
    price?: number;

    @ApiProperty({ description: 'Take Profit Price', required: false, example: 55000 })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    takeProfit?: number;

    @ApiProperty({ description: 'Broker ID for fee simulation', required: false, example: 'binance' })
    @IsOptional()
    @IsString()
    brokerId?: string;

    @ApiProperty({ enum: ['GTC', 'GTD', 'IOC'], example: 'GTC', description: 'Time in force', required: false })
    @IsOptional()
    @IsEnum(['GTC', 'GTD', 'IOC'])
    timeInForce?: 'GTC' | 'GTD' | 'IOC';

    @ApiProperty({ description: 'Expiry date for GTD orders (ISO 8601)', required: false, example: '2026-03-01T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @ApiProperty({ description: 'Trailing stop offset in % (e.g. 5 = sell if price drops 5% from peak)', required: false, example: 5 })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(50)
    trailingStopPercent?: number;
}

