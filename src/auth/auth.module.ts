import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { UserCredentialEntity } from './entities/user-credential.entity';
import { UserEntity } from '../users/user.entity';
import { AuthConstants } from './auth.constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserCredentialEntity, UserEntity]),
    PassportModule,
    JwtModule.register({
      secret: AuthConstants.SECRET,
      signOptions: { expiresIn: AuthConstants.EXPIRES_IN },
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
