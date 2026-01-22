import { Injectable, Inject } from '@nestjs/common';
import { UserEntity } from './user.entity';
import type { IUsersRepository } from './interfaces/users.repository.interface';

@Injectable()
export class UsersService {
    constructor(
        @Inject('USERS_REPOSITORY')
        private readonly userRepository: IUsersRepository,
    ) { }

    public async findOne(id: string): Promise<UserEntity | null> {
        return this.userRepository.findOne(id);
    }

    public async findByEmail(email: string): Promise<UserEntity | null> {
        return this.userRepository.findByEmail(email);
    }

    public async create(user: Partial<UserEntity>): Promise<UserEntity> {
        return this.userRepository.create(user);
    }
}
