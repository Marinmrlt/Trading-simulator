import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
    @ApiProperty({ example: 1000, description: 'Amount to deposit' })
    @IsNumber()
    @IsPositive()
    readonly amount: number;

    @ApiProperty({ example: 'USD', description: 'Currency code (USD, EUR, etc.)' })
    @IsString()
    @IsNotEmpty()
    readonly currency: string;
}
