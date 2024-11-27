import {
  Controller,
  HttpStatus,
  UseGuards,
  HttpCode,
  Post,
  Request,
  Get,
  Res,
  Req,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { User } from 'src/entities/user.entity';
import { LoginGuard } from './guards/login-guard/login-guard.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user.id);
  }

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

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);
    return res.json({
      accessToken: response.accesstoken,
      refreshToken: response.refreshtoken,
    }); // Set secure to true in production
  }
}
