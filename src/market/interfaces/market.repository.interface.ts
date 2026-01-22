import { AssetEntity } from '../asset.entity';

export interface IMarketRepository {
    count(): Promise<number>;
    save(assets: AssetEntity[]): Promise<AssetEntity[]>;
    find(): Promise<AssetEntity[]>;
    findBySymbol(symbol: string): Promise<AssetEntity | null>;
}
