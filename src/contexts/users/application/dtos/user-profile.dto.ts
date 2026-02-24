import { IsString, IsOptional, IsUrl, IsJSON } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
        instagram?: string;
    };
}
