import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protects a route with a valid access token: @UseGuards(JwtAuthGuard) */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
