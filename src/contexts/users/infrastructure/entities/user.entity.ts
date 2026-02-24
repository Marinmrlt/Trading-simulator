import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { UserCredentialEntity } from '../../../auth/infrastructure/entities/user-credential.entity';
import { UserProfileEntity } from './user-profile.entity';
import { IUser } from '../../domain/models/user.model';
import { Role } from '../../domain/models/role.enum';

@Entity('users')
export class UserEntity implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    // Password removed, moved to UserCredentialEntity

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: 'int', default: Role.Classic })
    role: number;

    @OneToOne(() => UserCredentialEntity, credential => credential.user)
    credential: UserCredentialEntity;

    @OneToOne(() => UserProfileEntity, profile => profile.user, { cascade: true })
    profile: UserProfileEntity;

    @Column({ type: 'text', nullable: true })
    hashedRefreshToken: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
