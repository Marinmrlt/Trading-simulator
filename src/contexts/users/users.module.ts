import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Application
import { UsersController } from './application/controllers/users.controller';

// Domain
import { UsersService } from './domain/services/users.service';

// Infrastructure
import { UserEntity } from './infrastructure/entities/user.entity';
import { UserProfileEntity } from './infrastructure/entities/user-profile.entity';
import { UsersRepository } from './infrastructure/repositories/users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserProfileEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'USERS_REPOSITORY',
      useClass: UsersRepository,
    }
  ],
  exports: [UsersService], // Export service for AuthModule
})
export class UsersModule { }
