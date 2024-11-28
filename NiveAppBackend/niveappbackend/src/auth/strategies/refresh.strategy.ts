import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { AuthService } from '../auth.service';
import { AuthJwtPayload } from '../types/auth-jwtPayload';

@Injectable()
export class refreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshjwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshjwtConfiguration.secret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    console.log('Request:', req, 'Payload', payload);
    const refreshToken = req.headers['authorization']
      ? req.headers['authorization'].replace('Bearer', '').trim()
      : null;
    console.log('Refresh Token extraído:', refreshToken);
    console.log('Payload do refresh token:', payload);
    console.log('Token de refresh extraído:', refreshToken);
    const userId = payload.sub;
    req['user'] = { id: userId };
    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
