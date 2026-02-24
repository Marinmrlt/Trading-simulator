import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
    @ApiProperty({ example: 'BTC', description: 'Asset symbol to watch' })
    @IsString()
    @IsNotEmpty()
    readonly symbol: string;

    @ApiProperty({ enum: ['ABOVE', 'BELOW'], example: 'ABOVE', description: 'Trigger when price goes above or below target' })
    @IsEnum(['ABOVE', 'BELOW'])
    readonly condition: 'ABOVE' | 'BELOW';

    @ApiProperty({ example: 100000, description: 'Target price to trigger alert' })
    @IsNumber()
    @IsPositive()
    readonly targetPrice: number;
}
