import { ApiProperty } from '@nestjs/swagger';
import { IUserProfile } from '../../domain/models/user.model';

export class UserProfilePresenter {
    @ApiProperty({ required: false })
    bio?: string;

    @ApiProperty({ required: false })
    avatarUrl?: string;

    @ApiProperty({ required: false })
    location?: string;

    @ApiProperty({ required: false })
    website?: string;

    @ApiProperty({ required: false })
    socialLinks?: any;

    constructor(profile: IUserProfile) {
        this.bio = profile.bio;
        this.avatarUrl = profile.avatarUrl;
        this.location = profile.location;
        this.website = profile.website;
        this.socialLinks = profile.socialLinks;
    }
}
