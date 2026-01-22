
import { ApiProperty } from '@nestjs/swagger';

export class AuthTokenPresenter {
    @ApiProperty({ description: 'JWT Access Token' })
    readonly accessToken: string;

    @ApiProperty({ example: 'Bearer', description: 'Token Type' })
    readonly type: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
        this.type = 'Bearer';
    }
}
