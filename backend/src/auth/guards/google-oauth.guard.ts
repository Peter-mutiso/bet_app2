import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { GOOGLE_OAUTH_CONFIGURED } from '../strategies/google.strategy';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleOAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (!GOOGLE_OAUTH_CONFIGURED) {
      this.logger.error(
        'Rejected /auth/google request: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are not set in .env',
      );
      throw new ServiceUnavailableException(
        'Google sign-in is not configured on this server yet.',
      );
    }

    return (super.canActivate(context) as ReturnType<
      CanActivate['canActivate']
    >);
  }

  /**
   * By default AuthGuard throws UnauthorizedException on failure, which would
   * short-circuit straight to a bare JSON 401 and skip the callback route's
   * own error handling (redirecting the browser back to the frontend with a
   * readable error). Returning null instead lets that happen: req.user ends
   * up unset, and AuthController.googleAuthCallback checks for that.
   */
  handleRequest<TUser = any>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      this.logger.warn(
        `Google OAuth request did not resolve to a user: ${
          err ? (err as Error).message : 'no user returned'
        }`,
      );
      return null as TUser;
    }

    return user;
  }
}
