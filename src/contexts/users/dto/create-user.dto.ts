
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail({}, { message: "L'adresse email est invalide" })
    email: string;

    @ApiProperty({ example: 'strongPassword123', description: 'Password (min 6 characters)' })
    @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
    @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
    password: string;

    @ApiProperty({ example: 'John', description: 'First name' })
    @IsString()
    @IsNotEmpty({ message: 'Le prénom est obligatoire' })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name' })
    @IsString()
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    lastName: string;
}
