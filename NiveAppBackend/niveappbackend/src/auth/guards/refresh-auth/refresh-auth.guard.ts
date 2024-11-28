import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service'; // Serviço que gerencia a autenticação e geração de tokens

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService, // Para verificar se o usuário existe e gerar novos tokens
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extrair o refresh token do cabeçalho da requisição
    const token = this.extractTokenFromHeader(request);
    console.log('Valor Refresh token:', token);
    if (token) {
      const decoded = this.jwtService.decode(token);
      console.log('Token Decodificado:', decoded); // Verifique se o payload contém a chave 'sub'
    }
    // Verificar se o refresh token existe
    if (!token) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    // Verificar a validade do accessToken
    const accessToken = request.body.accessToken;
    const validateAccess =
      await this.authService.isExpiredAccessToken(accessToken);
    console.log(await this.jwtService.decode(accessToken));

    // Se o accessToken não está expirado, mas é inválido, lança exceção
    if (validateAccess !== 'TokenExpiredError') {
      throw new UnauthorizedException('Access Token Encontrado e não Expirado');
    }

    // Verificar a validade do refresh token
    const validateRefresh = await this.authService.isExpiredRefreshToken(token);

    // Se o refresh token não for válido, lança exceção
    if (validateRefresh !== true) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
    const accessDecoded = this.jwtService.decode(request.body.accessToken);
    // Se o refresh token for válido, processa a requisição
    // Atribui o usuário ao objeto `request` para uso posterior
    request['user'] = accessDecoded.sub;
    console.log('user body id', request.body.id);

    // Gere novos tokens se necessário e atribua ao request

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
