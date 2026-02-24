import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { IUsersRepository } from '../../domain/ports/user-repository.port';
import { IUser } from '../../domain/models/user.model';

@Injectable()
export class UsersRepository implements IUsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly typeOrmRepo: Repository<UserEntity>,
    ) { }

    async findOne(id: string): Promise<IUser | null> {
        return this.typeOrmRepo.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return this.typeOrmRepo.findOne({ where: { email } });
    }

    async create(user: Partial<IUser>): Promise<IUser> {
        const newUser = this.typeOrmRepo.create(user);
        return this.typeOrmRepo.save(newUser);
    }

    async findWithProfile(id: string): Promise<IUser | null> {
        return this.typeOrmRepo.findOne({
            where: { id },
            relations: ['profile'],
        });
    }

    async save(user: IUser): Promise<IUser> {
        return this.typeOrmRepo.save(user as UserEntity); // Cast needed for TypeORM generic
    }
}
