import { UserEntity } from '../user.entity';

export interface IUsersRepository {
    findOne(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    create(user: Partial<UserEntity>): Promise<UserEntity>;
}
