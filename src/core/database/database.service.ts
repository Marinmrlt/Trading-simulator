import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(
        @Inject(ConfigService)
        private readonly config: ConfigService,
    ) { }

    public createTypeOrmOptions(): TypeOrmModuleOptions {
        const isDevelopment = this.config.get<string>('NODE_ENV') !== 'production';

        return {
            type: 'sqlite',
            database: this.config.get<string>('DB_DATABASE'),
            synchronize: this.config.get<string>('DB_SYNCHRONIZE') === 'true',
            logging: this.config.get<string>('DB_LOGGING') === 'true',
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            // If we are in the 'dist' folder (production/build), path might need adjustment
            // But since we are using relative path from this file (src/core/database), 
            // ../.. takes us to src/, then **/*.entity covers all contexts.
            migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
            migrationsRun: this.config.get<string>('DB_MIGRATIONS_RUN') === 'true',
        };
    }
}
