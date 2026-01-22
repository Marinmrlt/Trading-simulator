import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserPresenter } from '../users/user.presenter';
import { LoginDto } from './dto/login.dto';
import { AuthTokenPresenter } from './auth.presenter';
import { AuthService } from './auth.service';
import { AuthResponse } from './auth.types';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiOperation({ summary: 'Login user', description: 'Authenticate using email and password.' })
    @ApiResponse({ status: 201, description: 'Login successful.', type: AuthTokenPresenter })
    @Post('login')
    public async login(@Body() credentials: LoginDto): Promise<AuthResponse> {
        return await this.authService.login(credentials);
    }

    @ApiOperation({ summary: 'Register new user', description: 'Create a new user account.' })
    @ApiResponse({ status: 201, description: 'User successfully registered.', type: UserPresenter })
    @Post('register')
    public async register(@Body() newUser: CreateUserDto): Promise<UserPresenter> {
        return await this.authService.register(newUser);
    }

    @UseGuards(AtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Req() req: any) {
        const user = req.user;
        await this.authService.logout(user['sub']); // 'sub' is userId from AtStrategy
    }

    @UseGuards(RtGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Req() req: any) {
        const user = req.user;
        return this.authService.refreshTokens(user['sub'], user['refreshToken']);
    }
}
