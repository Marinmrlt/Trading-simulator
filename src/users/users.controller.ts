import { Controller, Get, Param, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserPresenter } from './user.presenter';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @ApiOperation({ summary: 'Get my profile', description: 'Retrieve profile of logged-in user.' })
    @ApiResponse({ status: 200, description: 'User profile.', type: UserPresenter })
    @Get('me')
    public async getMe(@Req() req): Promise<UserPresenter> {
        const userId = req.user.id;
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return new UserPresenter(user);
    }

    @ApiOperation({ summary: 'Get user profile', description: 'Retrieve user profile by ID (Admin only? keeping open for now).' })
    @ApiResponse({ status: 200, description: 'User profile found.', type: UserPresenter })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @Get('profile/:id')
    public async getProfile(@Param('id') id: string): Promise<UserPresenter> {
        const user = await this.usersService.findOne(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return new UserPresenter(user);
    }
}
