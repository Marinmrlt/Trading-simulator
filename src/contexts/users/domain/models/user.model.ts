export interface IUserProfile {
    id: string;
    userId: string;
    bio?: string;
    avatarUrl?: string;
    location?: string;
    website?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
        instagram?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

import { Role } from './role.enum';

export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: number;
    hashedRefreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    profile?: IUserProfile;
}
