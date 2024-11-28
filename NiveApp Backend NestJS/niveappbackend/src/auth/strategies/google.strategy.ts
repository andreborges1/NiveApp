import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { time } from 'console';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL:
        'https://180a-2804-14d-badc-81f9-00-f036.ngrok-free.app/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    console.log({ profile });
    const {
      sub: id,
      name: displayName,
      given_name: givenName,
      family_name: familyName,
      picture: photo,
      email,
      email_verified: emailVerified,
    } = profile._json;

    // Extraindo as informações
    console.log(id); // '113686270645963354683'
    console.log(displayName); // 'André João Borges'
    console.log(givenName); // 'André João'
    console.log(familyName); // 'Borges'
    console.log(photo); // 'https://lh3.googleusercontent.com/a/ACg8ocIb_G1psKidJ2HEx2qAxLlhiMSLUi4oJ2C0-J1feaAQP_Bobg=s96-c'
    console.log(email); // 'andrejoaoborges@gmail.com'
    console.log(emailVerified);
    // Chame a função validateGoogleUser com os dados extraídos
    const user = await this.authService.validateGoogleUser({
      email: email,
      name: displayName,
      platform: profile.provider,
      clerkId: null,
      firstName: givenName,
      lastName: familyName,
      picture: photo,
      username: displayName,
    });

    console.log(user);
    return user;
  }
}
