import { ApiProperty } from '@nestjs/swagger';
import { AssetEntity } from '../../infrastructure/entities/asset.entity';

export class AssetPresenter {
    @ApiProperty({ example: 'BTC' })
    symbol: string;

    @ApiProperty({ example: 'Bitcoin' })
    name: string;

    @ApiProperty({ example: '$50000.00' })
    price: string;

    @ApiProperty({ example: '+2.50%' })
    change: string;

    constructor(asset: AssetEntity) {
        this.symbol = asset.symbol;
        this.name = asset.name;
        this.price = `$${asset.price.toFixed(2)}`;
        this.change = `${asset.change24h > 0 ? '+' : ''}${asset.change24h.toFixed(2)}%`;
    }
}
