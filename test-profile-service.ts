import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/contexts/users/domain/services/users.service';
import { IUser } from './src/contexts/users/domain/models/user.model';
import { Role } from './src/contexts/users/domain/models/role.enum';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    console.log('Starting Profile Test...');

    // 1. Create a dummy user for testing (if not exists)
    const testEmail = 'profile-test-' + Date.now() + '@example.com';
    console.log(`Creating test user: ${testEmail}`);

    let user = await usersService.create({
        email: testEmail,
        firstName: 'Test',
        lastName: 'Profile',
        role: Role.Classic,
    });
    console.log('User created with ID:', user.id);

    // 2. Update Profile
    console.log('Updating profile...');
    const profileData = {
        bio: 'I am a test user',
        location: 'Moon Base',
        socialLinks: { twitter: '@testuser' }
    };

    user = await usersService.updateProfile(user.id, profileData);
    console.log('Profile updated.');

    // 3. Fetch Profile
    console.log('Fetching profile...');
    const fetchedUser = await usersService.getProfile(user.id);

    if (fetchedUser.profile) {
        console.log('Profile fetched successfully:');
        console.log('Bio:', fetchedUser.profile.bio);
        console.log('Location:', fetchedUser.profile.location);
        console.log('Social:', fetchedUser.profile.socialLinks);
    } else {
        console.error('Profile not found!');
    }

    await app.close();
}

bootstrap();
