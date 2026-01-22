
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'test@example.com', description: 'User email' })
    @IsEmail()
    readonly email: string;

    @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;
}
