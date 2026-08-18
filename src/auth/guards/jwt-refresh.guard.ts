import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protects POST /auth/refresh: expects the refresh token as a Bearer token. */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
