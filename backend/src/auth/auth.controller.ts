import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Get, Logger, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @UseGuards(JwtAuthGuard)
@Get('me')
getProfile(@CurrentUser() user: any) {
  return user;
}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** Kicks off the Google OAuth flow. Passport's GoogleOAuthGuard redirects to Google. */
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {
    // Intentionally empty — GoogleOAuthGuard handles the redirect to Google.
  }

  /** Google redirects back here after the user grants/denies consent. */
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as User | undefined;

      if (!user) {
        this.logger.warn('Google OAuth callback reached with no user on the request');
        const errorUrl = new URL('/login', FRONTEND_URL);
        errorUrl.searchParams.set('error', 'google_auth_failed');
        return res.redirect(errorUrl.toString());
      }

      const result = await this.authService.loginWithGoogleUser(user);

      // The token travels in the URL fragment (#), not a query string, so it
      // is never sent to the server or logged in Referer headers.
      const redirectUrl = new URL('/auth/callback', FRONTEND_URL);
      redirectUrl.hash = `token=${encodeURIComponent(result.accessToken)}`;

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error('Google OAuth callback failed', error as Error);

      const errorUrl = new URL('/login', FRONTEND_URL);
      errorUrl.searchParams.set('error', 'google_auth_failed');

      return res.redirect(errorUrl.toString());
    }
  }
}
