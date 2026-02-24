import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

import { UserEntity } from '../../../contexts/users/infrastructure/entities/user.entity';
import { UserCredentialEntity } from '../../../contexts/auth/infrastructure/entities/user-credential.entity';
import { UserProfileEntity } from '../../../contexts/users/infrastructure/entities/user-profile.entity';
import { AssetEntity } from '../../../contexts/market/infrastructure/entities/asset.entity';
import { WalletEntity } from '../../../contexts/wallet/infrastructure/entities/wallet.entity';
import { Role } from '../../../contexts/users/domain/models/role.enum';
import AppDataSource from '../../../../typeorm.config';

dotenv.config();

async function runSeed() {
    console.log('🌱 Starting Database Seeding...');

    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection initialized.');

        const assetRepo = AppDataSource.getRepository(AssetEntity);
        const userRepo = AppDataSource.getRepository(UserEntity);
        const credRepo = AppDataSource.getRepository(UserCredentialEntity);
        const walletRepo = AppDataSource.getRepository(WalletEntity);

        // 1. Seed Assets
        console.log('Seeding Assets...');
        const initialAssets = [
            { symbol: 'BTC/USD', name: 'Bitcoin', price: 95000, change24h: 2.5 },
            { symbol: 'ETH/USD', name: 'Ethereum', price: 3200, change24h: 1.2 },
            { symbol: 'EUR/USD', name: 'Euro', price: 1.08, change24h: -0.1 },
            { symbol: 'AAPL', name: 'Apple Inc.', price: 190.50, change24h: 0.5 },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 210.20, change24h: -1.5 },
        ];

        for (const assetData of initialAssets) {
            const existing = await assetRepo.findOneBy({ symbol: assetData.symbol });
            if (!existing) {
                const asset = new AssetEntity(assetData);
                await assetRepo.save(asset);
                console.log(`➕ Added Asset: ${asset.symbol}`);
            }
        }

        // 2. Seed Users
        console.log('Seeding Users...');
        const salt = await bcrypt.genSalt();
        const defaultPasswordHash = await bcrypt.hash('password123', salt);

        const initialUsers = [
            {
                email: 'admin@trading.com',
                firstName: 'Super',
                lastName: 'Admin',
                role: Role.Admin,
                balance: 1000000,
            },
            {
                email: 'classic@trading.com',
                firstName: 'Test',
                lastName: 'User',
                role: Role.Classic,
                balance: 10000,
            },
            {
                email: 'premium@trading.com',
                firstName: 'Pro',
                lastName: 'Trader',
                role: Role.Premium,
                balance: 50000,
            }
        ];

        for (const userData of initialUsers) {
            const existing = await userRepo.findOneBy({ email: userData.email });
            if (!existing) {
                // Create User
                const user = new UserEntity({
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role,
                });

                // Save user first to get ID
                const savedUser = await userRepo.save(user);

                // Create Credentials
                const credential = new UserCredentialEntity({
                    email: savedUser.email,
                    passwordHash: defaultPasswordHash,
                    user: savedUser,
                });
                await credRepo.save(credential);

                // Create Wallet
                const wallet = new WalletEntity({
                    userId: savedUser.id,
                    currency: 'USD',
                    balance: userData.balance,
                });
                await walletRepo.save(wallet);

                console.log(`➕ Added User: ${savedUser.email} (Role: ${savedUser.role}) with $${userData.balance}`);
            } else {
                console.log(`➖ User already exists: ${userData.email}`);
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during database seeding:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

runSeed();
