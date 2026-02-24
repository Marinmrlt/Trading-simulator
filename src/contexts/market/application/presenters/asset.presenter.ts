import { ApiProperty } from '@nestjs/swagger';
import { AssetEntity } from '../../infrastructure/entities/asset.entity';

export class AssetPresenter {
    @ApiProperty({ example: 'BTC' })
    symbol: string;

    @ApiProperty({ example: 'Bitcoin' })
    name: string;

    @ApiProperty({ example: 50000.00 })
    price: number;

    @ApiProperty({ example: 2.50 })
    change24h: number;

    @ApiProperty({ example: 'yahoo', description: 'The market data provider for this asset' })
    provider: string;

    constructor(asset: AssetEntity) {
        this.symbol = asset.symbol;
        this.name = asset.name;
        this.price = Number(asset.price);
        this.change24h = Number(asset.change24h);
        this.provider = asset.provider;
    }
}
