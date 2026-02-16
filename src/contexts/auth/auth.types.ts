export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}
