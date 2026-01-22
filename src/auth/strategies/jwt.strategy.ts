import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthConstants } from '../auth.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: AuthConstants.SECRET,
        });
    }

    async validate(payload: any) {
        // passport-jwt verifies signature and expiration automatically.
        // We just return the user object to be injected into Request.
        return { id: payload.sub, email: payload.email };
    }
}
