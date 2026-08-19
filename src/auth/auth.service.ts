import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { UserDocument } from '../user/schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// @nestjs/jwt's expiresIn option is typed against `ms`'s branded string
// literal ("15m", "7d", ...) rather than plain `string`.
type StringValue = import('ms').StringValue;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  user: UserResponseDto;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
    });

    return this.issueTokens(user);
  }

  // Login flow: validate input shape (DTO) -> find user -> compare password
  // -> generate access + refresh tokens.
  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const user = await this.userService.findByIdWithRefreshToken(userId);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    // Rotate: old refresh token is invalidated the moment a new one is issued.
    const { accessToken, refreshToken: newRefreshToken } =
      await this.issueTokens(user);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.setRefreshTokenHash(userId, null);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal whether the email is registered — succeed either way.
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    await this.userService.setResetToken(
      user._id.toString(),
      tokenHash,
      new Date(Date.now() + RESET_TOKEN_TTL_MS),
    );

    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetLink);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = this.hashToken(dto.token);
    const user = await this.userService.findByResetTokenHash(tokenHash);
    if (!user) {
      throw new UnauthorizedException('Reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userService.updatePassword(user._id.toString(), passwordHash);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userService.findByIdWithPassword(userId);
    if (!user) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const matches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userService.updatePassword(userId, passwordHash);
  }

  private async issueTokens(user: UserDocument): Promise<AuthResult> {
    const payload = { sub: user._id.toString(), email: user.email };

    // @nestjs/jwt types `expiresIn` as a branded "500ms"-style string literal
    // (via the `ms` package) rather than plain `string`, which an env-driven
    // value can never satisfy statically — hence the cast.
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_ACCESS_EXPIRES_IN',
        '15m',
      ) as StringValue,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as StringValue,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userService.setRefreshTokenHash(
      user._id.toString(),
      refreshTokenHash,
    );

    return {
      user: UserResponseDto.fromDocument(user),
      accessToken,
      refreshToken,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
