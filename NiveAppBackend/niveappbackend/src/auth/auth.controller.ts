import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { LoginGuard } from './guards/login-guard/login-guard.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('generate-token/:id')
  generateToken(@Param('id') id: string) {
    // Gerar o token temporário para esse ID
    const token = this.authService.generateTemporaryToken(id);
    return { token };
  }

  @UseGuards(LoginGuard)
  @Post('userid/:id')
  async clerkUserId(@Param('id') id: string) {
    return await this.authService.clerkLogin(id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Request() req) {
    console.log('Requisição de refresh recebida para o usuário:', req.user);
    console.log('ID do usuário no request:', req.user);
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Request() req) {
    this.authService.signOut(req.user);
  }
}
