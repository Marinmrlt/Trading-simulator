import { UserCredentialEntity } from '../../infrastructure/entities/user-credential.entity';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';

export interface IAuthRepository {
    findByEmail(email: string): Promise<UserCredentialEntity | null>;
    saveCredential(credential: UserCredentialEntity): Promise<UserCredentialEntity>;
    createUser(user: UserEntity, credential: UserCredentialEntity): Promise<UserEntity>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    findUserById(userId: string): Promise<UserEntity | null>;
}
