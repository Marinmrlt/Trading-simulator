import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Application
import { AuthController } from './application/controllers/auth.controller';

// Domain
import { AuthService } from './domain/services/auth.service';

// Infrastructure
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { UserCredentialEntity } from './infrastructure/entities/user-credential.entity';
import { UserEntity } from '../users/infrastructure/entities/user.entity';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RtStrategy } from './infrastructure/strategies/rt.strategy';

// Cross-module
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCredentialEntity, UserEntity]),
    PassportModule,
    WalletModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RtStrategy,
    {
      provide: 'AUTH_REPOSITORY',
      useClass: AuthRepository,
    }
  ],
  exports: [AuthService],
})
export class AuthModule { }
