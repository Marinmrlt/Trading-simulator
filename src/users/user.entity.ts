import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { UserCredentialEntity } from '../auth/entities/user-credential.entity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    // Password removed, moved to UserCredentialEntity

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ default: 'user' })
    role: 'admin' | 'user';

    @OneToOne(() => UserCredentialEntity, credential => credential.user)
    credential: UserCredentialEntity;

    @Column({ type: 'varchar', nullable: true })
    hashedRefreshToken: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}
