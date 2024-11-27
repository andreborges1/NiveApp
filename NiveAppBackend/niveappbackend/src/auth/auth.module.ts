import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import jwtConfig from './config/jwt.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshJwtConfig from './config/refresh-jwt.config';
import { refreshJwtStrategy } from './strategies/refresh.strategy';
import googleOauthConfig from './config/google-oauth.config';
import { AppServiceModule } from '../app-service.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { LoginGuard } from './guards/login-guard/login-guard.guard';
@Module({
  imports: [
    AppServiceModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    refreshJwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    RefreshAuthGuard,
    ConfigService,
    LoginGuard,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

/*
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },*/
