import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

const owner = { userId: 'owner-1', email: 'owner@example.com' };

describe('TeamController', () => {
  let controller: TeamController;
  let service: jest.Mocked<TeamService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: {
            invite: jest.fn(),
            listMembers: jest.fn().mockResolvedValue([]),
            removeMember: jest.fn(),
            getInvitePreview: jest.fn(),
            acceptNew: jest.fn(),
            acceptExisting: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(TeamController);
    service = module.get(TeamService);
  });

  describe('invite', () => {
    it('lets the account owner invite (accountId resolves to their own id)', async () => {
      await controller.invite(owner, owner.userId, {
        email: 'friend@example.com',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(service.invite).toHaveBeenCalledWith(
        'owner-1',
        'owner@example.com',
        'friend@example.com',
      );
    });

    it('blocks a team member from inviting into the account they belong to (accountId != their own id)', async () => {
      await expect(
        controller.invite(owner, 'some-other-owner-id', {
          email: 'friend@example.com',
        }),
      ).rejects.toThrow(ForbiddenException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(service.invite).not.toHaveBeenCalled();
    });
  });

  describe('removeMember', () => {
    it('blocks a non-owner from removing a team member', async () => {
      await expect(
        controller.removeMember(owner, 'some-other-owner-id', 'member-1'),
      ).rejects.toThrow(ForbiddenException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(service.removeMember).not.toHaveBeenCalled();
    });
  });

  describe('members', () => {
    it('reports isOwner based on whether accountId resolved to the caller themself', async () => {
      const asOwner = await controller.members(owner, owner.userId);
      expect(asOwner.isOwner).toBe(true);

      const asMember = await controller.members(owner, 'some-other-owner-id');
      expect(asMember.isOwner).toBe(false);
    });
  });
});
