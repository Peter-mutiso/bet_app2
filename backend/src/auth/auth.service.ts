import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UsersService } from '../users/users.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
  ) {}

  /** Issues the same JWT shape used by register()/login() for any authenticated user. */
  private async issueAuthResult(user: User, message: string) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const emailExists = await this.usersService.findByEmail(dto.email);

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const usernameExists = await this.usersService.findByUsername(dto.username);

    if (usernameExists) {
      throw new BadRequestException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
    });

    await this.walletService.create(user.id);

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Registration successful',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      // Account was created via Google sign-in and has no password set.
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please continue with Google.',
      );
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueAuthResult(user, 'Login successful');
  }

  /**
   * Resolves (or creates) the local user for a verified Google profile.
   * Called from GoogleStrategy.validate() during the OAuth callback.
   */
  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    displayName?: string;
  }): Promise<User> {
    const { googleId, email, displayName } = googleProfile;

    const existingByGoogleId = await this.usersService.findByGoogleId(
      googleId,
    );
    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    // An account with this email may already exist from normal registration —
    // link the Google identity to it instead of creating a duplicate account.
    const existingByEmail = await this.usersService.findByEmail(email);
    if (existingByEmail) {
      this.logger.log(
        `Linking Google account to existing user ${existingByEmail.id} (${email})`,
      );
      return this.usersService.linkGoogleId(existingByEmail.id, googleId);
    }

    const usernameSeed = displayName || email.split('@')[0];
    const username =
      await this.usersService.generateUniqueUsername(usernameSeed);

    this.logger.log(`Creating new user via Google sign-in: ${email}`);

    const user = await this.usersService.create({
      username,
      email,
      googleId,
    });

    await this.walletService.create(user.id);

    return user;
  }

  /** Issues the same JWT format used by register()/login(), for a Google-authenticated user. */
  async loginWithGoogleUser(user: User) {
    return this.issueAuthResult(user, 'Google login successful');
  }
}