import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    _id: { toString: () => 'user-id-1' },
    name: 'Arun Kumar',
    email: 'arun@example.com',
    passwordHash: '',
    refreshTokenHash: null as string | null,
  };

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('Password1', 10);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findById: jest.fn(),
            findByIdWithRefreshToken: jest.fn(),
            create: jest.fn(),
            setRefreshTokenHash: jest.fn(),
            setResetToken: jest.fn(),
            findByResetTokenHash: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => fallback,
            getOrThrow: (key: string) => `test-secret-${key}`,
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('throws when the email is already taken', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as never);

      await expect(
        service.register({
          name: 'Arun',
          email: 'arun@example.com',
          password: 'Password1',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('throws on an unknown email', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws on a wrong password', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(mockUser as never);

      await expect(
        service.login({ email: mockUser.email, password: 'WrongPass1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues tokens on a correct password', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(mockUser as never);
      userService.setRefreshTokenHash.mockResolvedValue(undefined);

      const result = await service.login({
        email: mockUser.email,
        password: 'Password1',
      });

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.user.email).toBe(mockUser.email);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(userService.setRefreshTokenHash).toHaveBeenCalledWith(
        'user-id-1',
        expect.any(String),
      );
    });
  });
});
