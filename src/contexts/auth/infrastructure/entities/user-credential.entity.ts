import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';

@Entity('user_credentials')
export class UserCredentialEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string; // Stored here for auth lookup

    @Column()
    passwordHash: string;

    @OneToOne(() => UserEntity, user => user.credential, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<UserCredentialEntity>) {
        Object.assign(this, partial);
    }
}
