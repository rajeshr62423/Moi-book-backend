import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { TeamMember, TeamMemberDocument } from './schemas/team-member.schema';
import { UserService } from '../user/user.service';
import { AuthService, AuthResult } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamMember.name)
    private readonly teamMemberModel: Model<TeamMemberDocument>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /** The account a user's data lives in: their own, unless they're an accepted member of someone else's team. */
  async resolveAccountId(userId: string): Promise<string> {
    const membership = await this.teamMemberModel
      .findOne({ memberId: userId, status: 'accepted' })
      .exec();
    return membership ? membership.ownerId.toString() : userId;
  }

  async invite(
    ownerId: string,
    ownerEmail: string,
    email: string,
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === ownerEmail.toLowerCase()) {
      throw new ConflictException("You can't invite yourself");
    }

    const existing = await this.teamMemberModel
      .findOne({ ownerId, email: normalizedEmail })
      .exec();
    if (existing?.status === 'accepted') {
      throw new ConflictException('This person is already on your team');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const inviteTokenHash = this.hashToken(token);
    const inviteExpires = new Date(Date.now() + INVITE_TOKEN_TTL_MS);

    if (existing) {
      // Re-inviting: refresh the token/expiry on the existing pending row rather than duplicating it.
      await this.teamMemberModel
        .updateOne({ _id: existing._id }, { inviteTokenHash, inviteExpires })
        .exec();
    } else {
      await this.teamMemberModel.create({
        ownerId,
        email: normalizedEmail,
        inviteTokenHash,
        inviteExpires,
      });
    }

    const owner = await this.userService.findById(ownerId);
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;
    await this.mailService.sendTeamInviteEmail(
      normalizedEmail,
      owner?.name ?? 'A DigiMoiBook user',
      inviteLink,
    );
  }

  async listMembers(ownerId: string): Promise<TeamMemberDocument[]> {
    return this.teamMemberModel
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async removeMember(ownerId: string, memberRecordId: string): Promise<void> {
    const result = await this.teamMemberModel
      .deleteOne({ _id: memberRecordId, ownerId })
      .exec();
    if (result.deletedCount === 0) {
      throw new ForbiddenException('Team member not found');
    }
  }

  async getInvitePreview(token: string): Promise<{
    email: string;
    ownerName: string;
    alreadyRegistered: boolean;
  }> {
    const invite = await this.findValidInviteByToken(token);
    const owner = await this.userService.findById(invite.ownerId.toString());
    const existingUser = await this.userService.findByEmail(invite.email);
    return {
      email: invite.email,
      ownerName: owner?.name ?? 'A DigiMoiBook user',
      alreadyRegistered: !!existingUser,
    };
  }

  async acceptNew(
    token: string,
    name: string,
    password: string,
  ): Promise<AuthResult> {
    const invite = await this.findValidInviteByToken(token);

    const existingUser = await this.userService.findByEmail(invite.email);
    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists — log in, then accept the invite from Settings',
      );
    }

    const result = await this.authService.register({
      name,
      email: invite.email,
      password,
    });

    await this.teamMemberModel
      .updateOne(
        { _id: invite._id },
        {
          status: 'accepted',
          memberId: result.user.id,
          acceptedAt: new Date(),
        },
      )
      .exec();

    return result;
  }

  async acceptExisting(
    userId: string,
    userEmail: string,
    token: string,
  ): Promise<void> {
    const invite = await this.findValidInviteByToken(token);
    if (invite.email !== userEmail.toLowerCase()) {
      throw new ForbiddenException(
        'This invite was sent to a different email address',
      );
    }

    await this.teamMemberModel
      .updateOne(
        { _id: invite._id },
        { status: 'accepted', memberId: userId, acceptedAt: new Date() },
      )
      .exec();
  }

  private async findValidInviteByToken(
    token: string,
  ): Promise<TeamMemberDocument> {
    const inviteTokenHash = this.hashToken(token);
    const invite = await this.teamMemberModel
      .findOne({
        inviteTokenHash,
        status: 'pending',
        inviteExpires: { $gt: new Date() },
      })
      .select('+inviteTokenHash')
      .exec();
    if (!invite) {
      throw new UnauthorizedException('Invite link is invalid or has expired');
    }
    return invite;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
