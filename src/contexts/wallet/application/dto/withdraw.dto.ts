import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
    @ApiProperty({ example: 500, description: 'Amount to withdraw' })
    @IsNumber({}, { message: 'Le montant doit être un nombre' })
    @IsPositive({ message: 'Le montant doit être positif' })
    readonly amount: number;

    @ApiProperty({ example: 'USD', description: 'Currency code (USD, EUR, etc.)' })
    @IsString()
    @IsNotEmpty({ message: 'La devise est obligatoire' })
    readonly currency: string;
}
