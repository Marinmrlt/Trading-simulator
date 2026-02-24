import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import { IWalletRepository } from '../../domain/ports/wallet-repository.port';

@Injectable()
export class WalletRepository implements IWalletRepository {
    constructor(
        @InjectRepository(WalletEntity)
        private readonly typeOrmRepo: Repository<WalletEntity>,
    ) { }

    async findByUserId(userId: string): Promise<WalletEntity[]> {
        return this.typeOrmRepo.find({ where: { userId } });
    }

    async findByUserAndCurrency(userId: string, currency: string): Promise<WalletEntity | null> {
        return this.typeOrmRepo.findOne({ where: { userId, currency } });
    }

    async save(wallet: WalletEntity): Promise<WalletEntity> {
        return this.typeOrmRepo.save(wallet);
    }

    create(wallet: Partial<WalletEntity>): WalletEntity {
        return this.typeOrmRepo.create(wallet);
    }

    async remove(wallet: WalletEntity): Promise<WalletEntity> {
        return this.typeOrmRepo.remove(wallet);
    }
}
