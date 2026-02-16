import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

export class UserPresenter {
    @ApiProperty({ example: 'uuid-v4', description: 'User ID' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ example: 'user' })
    role: string;

    @ApiProperty()
    createdAt: Date;

    constructor(user: UserEntity) {
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.role = user.role;
        this.createdAt = user.createdAt;
    }
}
