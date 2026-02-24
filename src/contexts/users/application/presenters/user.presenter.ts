import { ApiProperty } from '@nestjs/swagger';
import { IUser } from '../../domain/models/user.model';
import { UserProfilePresenter } from './user-profile.presenter';
import { Role } from '../../domain/models/role.enum';

export class UserPresenter {
    @ApiProperty({ example: 'uuid-v4', description: 'User ID' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ example: ['classic'] })
    roles: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({ required: false })
    profile?: UserProfilePresenter;

    constructor(user: IUser) {
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;

        // Convert bitwise role to string array
        this.roles = [];
        if ((user.role & Role.Admin) === Role.Admin) this.roles.push('admin');
        if ((user.role & Role.Classic) === Role.Classic) this.roles.push('classic');
        if ((user.role & Role.Premium) === Role.Premium) this.roles.push('premium');

        this.createdAt = user.createdAt;
        if (user.profile) {
            this.profile = new UserProfilePresenter(user.profile);
        }
    }
}
