import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { IUsersRepository } from '../interfaces/users.repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly typeOrmRepo: Repository<UserEntity>,
    ) { }

    async findOne(id: string): Promise<UserEntity | null> {
        return this.typeOrmRepo.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.typeOrmRepo.findOne({ where: { email } });
    }

    async create(user: Partial<UserEntity>): Promise<UserEntity> {
        const newUser = this.typeOrmRepo.create(user);
        return this.typeOrmRepo.save(newUser);
    }
}
