
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'test@example.com', description: 'User email' })
    @IsEmail({}, { message: "L'adresse email est invalide" })
    readonly email: string;

    @ApiProperty({ example: 'password123', description: 'User password (min 6 chars)' })
    @IsString()
    @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
    readonly password: string;
}
