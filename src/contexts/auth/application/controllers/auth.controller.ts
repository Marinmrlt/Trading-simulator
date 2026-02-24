import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiStandardResponse } from '../../../../core/decorators/api-standard-response.decorator';
import { CreateUserDto } from '../../../users/application/dto/create-user.dto';
import { UserPresenter } from '../../../users/application/presenters/user.presenter';
import { LoginDto } from '../dto/login.dto';
import { AuthTokenPresenter } from '../presenters/auth.presenter';
import { AuthService } from '../../domain/services/auth.service';
import { AuthResponse } from '../../domain/types/auth.types';
import { AtGuard } from '../../infrastructure/guards/at.guard';
import { RtGuard } from '../../infrastructure/guards/rt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @ApiOperation({ summary: 'Login user', description: 'Authenticate using email and password.' })
    @ApiStandardResponse(AuthTokenPresenter)
    @Post('login')
    public async login(@Body() credentials: LoginDto): Promise<AuthResponse> {
        return await this.authService.login(credentials);
    }

    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @ApiOperation({ summary: 'Register new user', description: 'Create a new user account.' })
    @ApiStandardResponse(UserPresenter)
    @Post('register')
    public async register(@Body() newUser: CreateUserDto): Promise<UserPresenter> {
        return await this.authService.register(newUser);
    }

    @UseGuards(AtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: any) {
        const user = req.user;
        await this.authService.logout(user.id);
    }

    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Req() req: any) {
        const user = req.user;
        return this.authService.refreshTokens(user['sub'], user['refreshToken']);
    }
}

