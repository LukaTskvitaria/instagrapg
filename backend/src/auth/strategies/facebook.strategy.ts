import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService, FacebookProfile } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      scope: ['email', 'public_profile', 'instagram_basic', 'pages_read_engagement'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    
    const facebookProfile: FacebookProfile = {
      id,
      email: emails?.[0]?.value,
      name: displayName,
      picture: photos?.[0] ? { data: { url: photos[0].value } } : undefined,
    };

    const user = await this.authService.validateFacebookUser(facebookProfile);
    
    // Store access token for Instagram API calls
    return { ...user, facebookAccessToken: accessToken };
  }
}
