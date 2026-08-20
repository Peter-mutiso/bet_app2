import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt',) {
  constructor() {
    console.log('✅ JwtStrategy constructor');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    console.log('✅ JwtStrategy validate', payload);

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}