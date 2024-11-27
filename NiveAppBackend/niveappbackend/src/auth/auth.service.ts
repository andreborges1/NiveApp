import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppService } from '../app.service';
import { JwtService } from '@nestjs/jwt'; // Importando JwtSignOptions
import { AuthJwtPayload } from './types/auth-jwtPayload';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { CurrentUser } from './types/current-user';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  constructor(
    private usersService: AppService,
    private jwtService: JwtService,
  ) {}

  generateTemporaryToken(id: string) {
    const payload = { id };
    const options = {
      expiresIn: '5m', // Token expira em 5 minutos
      jwtid: 'unique-identifier', // Garantir que o token seja único
    };
    return this.jwtService.sign(payload, options);
  }

  // Função para validar o token temporário
  async validateTemporaryToken(token: string): Promise<boolean> {
    try {
      // Tenta verificar e decodificar o token
      this.jwtService.verify(token, { ignoreExpiration: false });
      return true; // Token válido
    } catch (e) {
      return false; // Token inválido ou expirado
    }
  }

  async clerkService(id: string) {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const userList = await clerkClient.users.getUser(id);
    return userList;
  }

  async clerkLogin(id) {
    const findClerkId = await this.clerkService(id);
    if (!findClerkId.id) {
      return 'clerkFail';
    }
    console.log('Clerk Found User', findClerkId.id);
    const databaseClerk = await this.usersService.findByClerk(findClerkId.id);
    console.log('Clerk Found User in DataBase', databaseClerk.id);
    try {
      if (!databaseClerk) {
        const createdUser =
          await this.usersService.createUserOverClerk(findClerkId);
        if (createdUser === 'clerkFail') {
          return 'clerkFail';
        }
        const login = await this.login(createdUser.id);
        return {
          accessToken: login.accesstoken,
          refreshToken: login.refreshtoken,
        };
      }
      if (databaseClerk) {
        console.log('Clerk Found User in DataBase 2', databaseClerk.id);
        const login = await this.login(databaseClerk.id);
        return {
          accessToken: login.accesstoken,
          refreshToken: login.refreshtoken,
        };
      }
    } catch {
      return 'clerkFail';
    }
  }

  async login(userId: number) {
    // const payload: AuthJwtPayload = { sub: userId };
    // const token = this.jwtService.sign(payload);
    //  const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const hashedAccessToken = await argon2.hash(accessToken);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );
    await this.usersService.updateHashedAccessToken(userId, hashedAccessToken);
    console.log(userId, accessToken, refreshToken);
    return {
      id: userId,
      accesstoken: accessToken,
      refreshtoken: refreshToken,
    };
  }

  async refreshToken(userId: number) {
    console.log('Gerando novos tokens para o usuário:', userId);
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    console.log('Novos tokens gerados:', { accessToken, refreshToken });

    //Gera
    const hashedRefreshToken = await argon2.hash(refreshToken);
    const hashedAccessToken = await argon2.hash(accessToken);

    //Grava
    await this.usersService.updateHashedAccessToken(userId, hashedAccessToken);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );

    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: process.env.REFRESH_JWT_EXPIRE_IN,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async isExpiredAccessToken(accessToken: string) {
    try {
      console.log('Access Token:', accessToken);
      const payloads = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_SECRET,
      });
      console.log(payloads);
      return true;
    } catch (error) {
      console.log(error);
      if (error.name === 'TokenExpiredError') {
        return error.name;
      }
      throw new UnauthorizedException('user not found');
    }
  }

  async isExpiredRefreshToken(refreshToken: string) {
    try {
      console.log('Refresh Token:', refreshToken);
      const payloads = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_JWT_SECRET,
      });
      console.log(payloads);
      return true;
    } catch (error) {
      console.log(error);
      if (error.name === 'TokenExpiredError') {
        return error.name;
      }
      throw new UnauthorizedException('user not found');
    }
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    console.log('Validando refresh token para o usuário:', userId);
    console.log('Refresh Token recebido:', refreshToken);
    const user = await this.usersService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('invalid refresh token');
    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('invalid refresh token');
    return userId;
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.usersService.findbyEmail(googleUser.email);
    console.log(user);
    if (user) {
      return user;
    }
    console.log('ui');
    return await this.usersService.create(googleUser);
  }

  async signOut(userId: number) {
    await this.usersService.updateHashedRefreshToken(userId, null);
    await this.usersService.updateHashedAccessToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id, role: user.role };
    return currentUser;
  }
}
/*
  async validateOrCreateGoogleUser(googleUser: CreateUserDto) {
    // Tenta encontrar o usuário pelo e-mail
    let user = await this.usersService.findbyEmail(googleUser.email);

    // Se o usuário não existir, tenta criá-lo
    if (!user) {
      const createdUser = await this.usersService.create(googleUser);
      // Verifique se houve um erro ao criar o usuário
      if ('message' in createdUser) {
        return {
          message:
            'Não foi possível criar o usuário, tente novamente mais tarde.',
        };
      }
      let user = createdUser; // Se foi criado com sucesso, atribui ao usuário
    }

    // Tenta gerar tokens para o usuário
    const tokens = await this.generateTokens(user.id);
    if (!tokens) {
      return {
        message: 'Não foi possível fazer login, tente novamente mais tarde.',
      };
    }
    const nome = user.name;
    // Retorna o usuário e os tokens se tudo der certo
    return { nome, tokens };
}
  /*
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateHashedRefreshToken(
      userId,
      hashedRefreshToken,
    );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
    */
