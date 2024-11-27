import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Injectable, Inject } from '@nestjs/common';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false, // Idealmente, você não deve ignorar a expiração
    });
  }

  async validate(payload: AuthJwtPayload) {
    console.log('Payload', payload);
    // Aqui, você pode validar a payload e retornar qualquer dado necessário para o req.user
    const user = await this.authService.validateJwtUser(payload.sub);
    // Se não encontrar o usuário, você pode lançar um erro
    if (!user) {
      throw new UnauthorizedException('Usuário inválido');
    }

    return { sub: payload.sub }; // Isso será atribuído a req.user no controller
  }
}
