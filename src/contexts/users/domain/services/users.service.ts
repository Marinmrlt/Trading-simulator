import { Injectable, Inject } from '@nestjs/common';
import { IUser } from '../models/user.model';
import { UserNotFoundError } from '../errors/users.errors';
import type { IUsersRepository } from '../ports/user-repository.port';

@Injectable()
export class UsersService {
    constructor(
        @Inject('USERS_REPOSITORY')
        private readonly userRepository: IUsersRepository,
    ) { }

    public async findOne(id: string): Promise<IUser | null> {
        const user = await this.userRepository.findOne(id);
        if (!user) throw new UserNotFoundError(id);
        return user;
    }

    public async findByEmail(email: string): Promise<IUser | null> {
        return this.userRepository.findByEmail(email);
    }

    public async create(user: Partial<IUser>): Promise<IUser> {
        return this.userRepository.create(user);
    }

    public async getProfile(userId: string): Promise<IUser> {
        const user = await this.userRepository.findWithProfile(userId);
        if (!user) throw new UserNotFoundError(userId);
        return user;
    }

    public async updateProfile(userId: string, profileData: any): Promise<IUser> {
        const user = await this.userRepository.findWithProfile(userId);
        if (!user) throw new UserNotFoundError(userId);

        if (!user.profile) {
            // Create new profile object structure if using interface
            // Note: Directly assigning to 'user.profile' might require casting if 'user' is strict entity
            // In Clean Architecture, we might need a mapper or factory here, but for now we rely on TypeORM entity behavior
            (user as any).profile = profileData;
        } else {
            Object.assign(user.profile, profileData);
        }

        return this.userRepository.save(user);
    }
}
