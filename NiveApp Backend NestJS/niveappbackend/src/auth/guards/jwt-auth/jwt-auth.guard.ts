import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super(); // Chama o super para utilizar a estratégia do Passport
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado');
    }

    // Validando o token de acesso
    try {
      this.jwtService.verify(token); // Verifica se o token é válido e não expirou
    } catch (error) {
      throw new UnauthorizedException('Access token inválido ou expirado');
    }

    // Aguarda a verificação do token e retorna um valor booleano
    const canActivate = await super.canActivate(context);
    return !!canActivate; // Converte para booleano explícito
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
