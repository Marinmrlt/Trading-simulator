import { IUser } from '../models/user.model';

export interface IUsersRepository {
    findOne(id: string): Promise<IUser | null>;
    findWithProfile(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    create(user: Partial<IUser>): Promise<IUser>;
    save(user: IUser): Promise<IUser>;
}
