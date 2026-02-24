import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

import { IUserProfile } from '../../domain/models/user.model';

@Entity('user_profiles')
export class UserProfileEntity implements IUserProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    bio: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    website: string;

    @Column('simple-json', { nullable: true })
    socialLinks: {
        twitter?: string;
        linkedin?: string;
        github?: string;
        instagram?: string;
    };

    @OneToOne(() => UserEntity, user => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: UserEntity;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<UserProfileEntity>) {
        Object.assign(this, partial);
    }
}
