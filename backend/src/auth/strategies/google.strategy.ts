import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
  Profile,
} from 'passport-google-oauth20';

import { AuthService } from '../auth.service';

export const GOOGLE_OAUTH_CONFIGURED = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      // Fallback placeholders keep Passport's constructor from throwing at
      // Nest bootstrap time when Google OAuth hasn't been configured yet.
      // GoogleOAuthGuard rejects requests before this strategy ever runs
      // in that case, so these values are never actually used with Google.
      clientID: process.env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    } satisfies StrategyOptions);

    if (!GOOGLE_OAUTH_CONFIGURED) {
      this.logger.warn(
        'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set. ' +
          '/auth/google will respond with 503 until they are configured in .env',
      );
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        this.logger.error(
          `Google profile ${profile.id} did not include an email address`,
        );
        return done(
          new Error('Google account has no accessible email address'),
          false,
        );
      }

      const user = await this.authService.validateGoogleUser({
        googleId: profile.id,
        email,
        displayName: profile.displayName,
      });

      return done(null, user);
    } catch (error) {
      this.logger.error('Google OAuth validation failed', error as Error);
      return done(error as Error, false);
    }
  }
}
