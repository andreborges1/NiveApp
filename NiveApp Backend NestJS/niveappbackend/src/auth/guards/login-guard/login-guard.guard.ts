import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Certifique-se de que você tem o JwtService

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {} // Injeção do JwtService

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { token } = request.body; // Pega o token do corpo da requisição

    if (!token) {
      throw new UnauthorizedException(
        'Token não encontrado no corpo da requisição',
      );
    }

    try {
      // Verifica a validade do token
      const decoded = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
      });
      // Se o token for válido, permite o acesso à rota
      return true;
    } catch (e) {
      // Se o token for inválido ou expirado, lança um erro específico
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
