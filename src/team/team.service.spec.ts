import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamMember } from './schemas/team-member.schema';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

function chainable<T>(result: T) {
  return {
    select: () => chainable(result),
    exec: () => Promise.resolve(result),
  };
}

describe('TeamService', () => {
  let service: TeamService;
  let model: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    updateOne: jest.Mock;
    deleteOne: jest.Mock;
  };
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;
  let mailService: jest.Mocked<MailService>;

  beforeEach(async () => {
    model = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      updateOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: getModelToken(TeamMember.name), useValue: model },
        {
          provide: UserService,
          useValue: { findById: jest.fn(), findByEmail: jest.fn() },
        },
        { provide: AuthService, useValue: { register: jest.fn() } },
        {
          provide: MailService,
          useValue: {
            sendTeamInviteEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
      ],
    }).compile();

    service = module.get(TeamService);
    userService = module.get(UserService);
    authService = module.get(AuthService);
    mailService = module.get(MailService);
  });

  describe('resolveAccountId', () => {
    it("returns the user's own id when they aren't an accepted member of any team", async () => {
      model.findOne.mockReturnValue(chainable(null));
      await expect(service.resolveAccountId('user-1')).resolves.toBe('user-1');
    });

    it("returns the owner's id when the user is an accepted team member", async () => {
      model.findOne.mockReturnValue(
        chainable({ ownerId: { toString: () => 'owner-1' } }),
      );
      await expect(service.resolveAccountId('member-1')).resolves.toBe(
        'owner-1',
      );
    });
  });

  describe('invite', () => {
    it("rejects inviting the owner's own email", async () => {
      await expect(
        service.invite('owner-1', 'owner@example.com', 'owner@example.com'),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects when the invitee is already an accepted team member', async () => {
      model.findOne.mockReturnValue(chainable({ status: 'accepted' }));
      await expect(
        service.invite('owner-1', 'owner@example.com', 'friend@example.com'),
      ).rejects.toThrow(ConflictException);
    });

    it('creates a new invite and sends the email when none exists yet', async () => {
      model.findOne.mockReturnValue(chainable(null));
      model.create.mockResolvedValue({});
      userService.findById.mockResolvedValue({ name: 'Rajesh' } as never);

      await service.invite(
        'owner-1',
        'owner@example.com',
        'Friend@Example.com',
      );

      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: 'owner-1',
          email: 'friend@example.com',
        }),
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(mailService.sendTeamInviteEmail).toHaveBeenCalledWith(
        'friend@example.com',
        'Rajesh',
        expect.stringContaining('/accept-invite?token='),
      );
    });
  });

  describe('removeMember', () => {
    it('throws when nothing was deleted', async () => {
      model.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });
      await expect(service.removeMember('owner-1', 'member-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('succeeds when a row was deleted', async () => {
      model.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });
      await expect(
        service.removeMember('owner-1', 'member-1'),
      ).resolves.toBeUndefined();
    });
  });

  describe('acceptNew', () => {
    it('rejects when an account already exists for the invited email', async () => {
      model.findOne.mockReturnValue(
        chainable({
          email: 'friend@example.com',
          status: 'pending',
          inviteExpires: new Date(Date.now() + 1000),
        }),
      );
      userService.findByEmail.mockResolvedValue({} as never);

      await expect(
        service.acceptNew('tok', 'Friend', 'Passw0rd1'),
      ).rejects.toThrow(ConflictException);
    });

    it('registers the new user and marks the invite accepted', async () => {
      const invite = {
        _id: 'invite-1',
        email: 'friend@example.com',
        status: 'pending',
        inviteExpires: new Date(Date.now() + 1000),
      };
      model.findOne.mockReturnValue(chainable(invite));
      userService.findByEmail.mockResolvedValue(null);
      authService.register.mockResolvedValue({
        user: { id: 'new-user-1' },
        accessToken: 'a',
        refreshToken: 'b',
      } as never);

      const result = await service.acceptNew('tok', 'Friend', 'Passw0rd1');

      expect(result.user.id).toBe('new-user-1');
      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: 'invite-1' },
        expect.objectContaining({ status: 'accepted', memberId: 'new-user-1' }),
      );
    });
  });

  describe('acceptExisting', () => {
    const invite = {
      _id: 'invite-1',
      email: 'friend@example.com',
      status: 'pending',
      inviteExpires: new Date(Date.now() + 1000),
    };

    it('rejects when the logged-in email does not match the invite', async () => {
      model.findOne.mockReturnValue(chainable(invite));
      await expect(
        service.acceptExisting('user-1', 'someone-else@example.com', 'tok'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('marks the invite accepted for a matching email', async () => {
      model.findOne.mockReturnValue(chainable(invite));
      await service.acceptExisting('user-1', 'friend@example.com', 'tok');
      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: 'invite-1' },
        expect.objectContaining({ status: 'accepted', memberId: 'user-1' }),
      );
    });
  });

  it('rejects an invalid or expired invite token', async () => {
    model.findOne.mockReturnValue(chainable(null));
    await expect(service.getInvitePreview('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
