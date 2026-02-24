import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidCredentialsError, UserAlreadyExistsError } from '../errors/auth.errors';
import { AccessDeniedError, InvalidTokenError } from '../errors/jwt.errors';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IAuthRepository } from '../ports/auth-repository.port';
import { UserEntity } from '../../../users/infrastructure/entities/user.entity';
import { UserCredentialEntity } from '../../infrastructure/entities/user-credential.entity';
import { CreateUserDto } from '../../../users/application/dto/create-user.dto';
import { LoginDto } from '../../application/dto/login.dto';
import { AuthResponse } from '../types/auth.types';
import { UserPresenter } from '../../../users/application/presenters/user.presenter';
import { WalletService } from '../../../wallet/domain/services/wallet.service';
import { Role } from '../../../users/domain/models/role.enum';

@Injectable()
export class AuthService {
    constructor(
        @Inject('AUTH_REPOSITORY')
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly walletService: WalletService,
    ) { }

    public async register(dto: CreateUserDto): Promise<UserPresenter> {
        // Check if user exists
        const existing = await this.authRepository.findByEmail(dto.email);
        if (existing) {
            throw new UserAlreadyExistsError(dto.email);
        }

        // Hash password
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(dto.password, salt);

        // Prepare Entities
        const user = new UserEntity({
            email: dto.email,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: Role.Classic,
        });

        const credential = new UserCredentialEntity({
            email: dto.email,
            passwordHash: hash,
        });

        // Transactional save
        const savedUser = await this.authRepository.createUser(user, credential);

        // Auto-create USD wallet with $10,000 starting balance (simulator standard)
        await this.walletService.deposit(savedUser.id, 10000, 'USD');

        return new UserPresenter(savedUser);
    }

    public async login(dto: LoginDto): Promise<AuthResponse> {
        const credential = await this.authRepository.findByEmail(dto.email);
        if (!credential) throw new InvalidCredentialsError();

        const isMatch = await bcrypt.compare(dto.password, credential.passwordHash);
        if (!isMatch) throw new InvalidCredentialsError();

        const tokens = await this.getTokens(credential.userId, credential.email);
        await this.updateRefreshTokenHash(credential.userId, tokens.refresh_token);

        // Map to AuthResponse
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: 900,
        };
    }

    public async logout(userId: string): Promise<void> {
        await this.authRepository.updateRefreshToken(userId, null);
    }

    public async refreshTokens(userId: string, rt: string): Promise<AuthResponse> {
        const user = await this.authRepository.findUserById(userId);
        if (!user || !user.hashedRefreshToken) throw new AccessDeniedError();

        const isMatch = await bcrypt.compare(rt, user.hashedRefreshToken);
        if (!isMatch) throw new AccessDeniedError();

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: 900,
        };
    }

    async updateRefreshTokenHash(userId: string, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.authRepository.updateRefreshToken(userId, hash);
    }

    async getTokens(userId: string, email: string) {
        // Access Token
        const atPayload = { sub: userId, email };
        const at = await this.jwtService.signAsync(atPayload, {
            expiresIn: '15m',
            secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });

        // Refresh Token
        const rtPayload = { sub: userId, email };
        const rt = await this.jwtService.signAsync(rtPayload, {
            expiresIn: '7d',
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        });

        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}
