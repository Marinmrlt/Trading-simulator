import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetEntity } from '../entities/asset.entity';
import { IMarketRepository } from '../../domain/ports/market-repository.port';

@Injectable()
export class MarketRepository implements IMarketRepository {
    constructor(
        @InjectRepository(AssetEntity)
        private readonly typeOrmRepo: Repository<AssetEntity>,
    ) { }

    async count(): Promise<number> {
        return this.typeOrmRepo.count();
    }

    async save(assets: AssetEntity[]): Promise<AssetEntity[]> {
        return this.typeOrmRepo.save(assets);
    }

    async find(): Promise<AssetEntity[]> {
        return this.typeOrmRepo.find();
    }

    async findBySymbol(symbol: string): Promise<AssetEntity | null> {
        return this.typeOrmRepo.findOne({ where: { symbol } });
    }
}
