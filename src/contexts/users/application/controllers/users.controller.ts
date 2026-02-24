import { Controller, Get, Param, UseGuards, Req, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UpdateProfileDto } from '../dtos/user-profile.dto';
import { UserPresenter } from '../presenters/user.presenter';
import { UsersService } from '../../domain/services/users.service';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

import { Roles } from '../../../auth/application/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Role } from '../../domain/models/role.enum';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @ApiOperation({ summary: 'Get my profile', description: 'Retrieve profile of logged-in user.' })
    @ApiResponse({ status: 200, description: 'User profile.', type: UserPresenter })
    @Get('me')
    public async getMe(@Req() req): Promise<UserPresenter> {
        const userId = req.user.id;
        const user = await this.usersService.getProfile(userId);
        return new UserPresenter(user);
    }

    @ApiOperation({ summary: 'Get user profile', description: 'Retrieve user profile by ID.' })
    @ApiResponse({ status: 200, description: 'User profile found.', type: UserPresenter })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @ApiOperation({ summary: 'Get user profile', description: 'Retrieve user profile by ID.' })
    @ApiResponse({ status: 200, description: 'User profile found.', type: UserPresenter })
    @ApiResponse({ status: 404, description: 'User not found.' })
    @Roles(Role.Admin) // Only Admin can access other profiles (example policy change or keep as is)
    @Get('profile/:id')
    public async getProfile(@Param('id') id: string): Promise<UserPresenter> {
        const user = await this.usersService.getProfile(id);
        return new UserPresenter(user);
    }

    @ApiOperation({ summary: 'Update my profile', description: 'Update profile information for logged-in user.' })
    @ApiResponse({ status: 200, description: 'Profile updated.', type: UserPresenter })
    @Roles(Role.Classic | Role.Admin | Role.Premium)
    @Put('me/profile')
    public async updateMyProfile(@Req() req, @Body() dto: UpdateProfileDto): Promise<UserPresenter> {
        const userId = req.user.id;
        const user = await this.usersService.updateProfile(userId, dto);
        return new UserPresenter(user);
    }
}
