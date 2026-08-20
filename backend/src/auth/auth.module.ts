import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
  PassportModule,
  UsersModule,
  WalletModule,
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: '15m',
    },
  }),
],
  controllers: [AuthController],
  providers: [
  AuthService,
  JwtStrategy,
  GoogleStrategy,
],
  exports: [
  AuthService,
  JwtStrategy,
  PassportModule,
  JwtModule,
],
})
export class AuthModule {}