import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt.strategy';

export interface AuthenticatedRefresh {
  userId: string;
  email: string;
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): AuthenticatedRefresh {
    // The strategy only verifies the JWT's signature/expiry; auth.service
    // additionally checks this raw token against the user's stored
    // refreshTokenHash so a logged-out or rotated token stops working even
    // if it hasn't expired yet.
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req) ?? '';
    return { userId: payload.sub, email: payload.email, refreshToken };
  }
}
