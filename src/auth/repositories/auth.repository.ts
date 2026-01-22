import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import { UserCredentialEntity } from '../entities/user-credential.entity';
import { UserEntity } from '../../users/user.entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
    constructor(
        @InjectRepository(UserCredentialEntity)
        private readonly credentialRepo: Repository<UserCredentialEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private dataSource: DataSource // For transactions
    ) { }

    async findByEmail(email: string): Promise<UserCredentialEntity | null> {
        return this.credentialRepo.findOne({
            where: { email },
            relations: ['user']
        });
    }

    async saveCredential(credential: UserCredentialEntity): Promise<UserCredentialEntity> {
        return this.credentialRepo.save(credential);
    }

    async createUser(user: UserEntity, credential: UserCredentialEntity): Promise<UserEntity> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Save user first
            const savedUser = await queryRunner.manager.save(user);

            // Link credential to user
            credential.user = savedUser;
            credential.userId = savedUser.id; // redundant but safe
            await queryRunner.manager.save(credential);

            await queryRunner.commitTransaction();
            return savedUser;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        await this.userRepo.update(userId, { hashedRefreshToken: refreshToken });
    }

    async findUserById(userId: string): Promise<UserEntity | null> {
        return this.userRepo.findOne({ where: { id: userId } });
    }
}
