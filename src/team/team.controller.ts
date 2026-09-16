import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AccountId } from './account-id.decorator';
import { TeamService } from './team.service';
import { InviteTeamMemberDto } from './dto/invite-team-member.dto';
import { AcceptNewInviteDto } from './dto/accept-new-invite.dto';
import { AcceptExistingInviteDto } from './dto/accept-existing-invite.dto';
import {
  TeamMemberResponseDto,
  TeamResponseDto,
} from './dto/team-member-response.dto';
import { InvitePreviewResponseDto } from './dto/invite-preview-response.dto';

/**
 * Team management always uses the caller's real identity (@CurrentUser),
 * never the resolved @AccountId — only the true account owner may invite or
 * remove members. A team member calling these would otherwise manage their
 * own (empty) team instead of the shared one; the explicit ownership check
 * below turns that into a clear 403 instead of a silent no-op.
 */
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(JwtAuthGuard)
  @Post('invite')
  @ApiMessage('Invite sent successfully')
  async invite(
    @CurrentUser() user: AuthenticatedUser,
    @AccountId() accountId: string,
    @Body() dto: InviteTeamMemberDto,
  ): Promise<null> {
    this.assertIsOwner(user.userId, accountId);
    await this.teamService.invite(user.userId, user.email, dto.email);
    return null;
  }

  @UseGuards(JwtAuthGuard)
  @Get('members')
  async members(
    @CurrentUser() user: AuthenticatedUser,
    @AccountId() accountId: string,
  ): Promise<TeamResponseDto> {
    const members = await this.teamService.listMembers(accountId);
    return {
      isOwner: user.userId === accountId,
      members: members.map((m) => TeamMemberResponseDto.fromDocument(m)),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('members/:id')
  @ApiMessage('Team member removed')
  async removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    this.assertIsOwner(user.userId, accountId);
    await this.teamService.removeMember(accountId, id);
    return null;
  }

  @Get('invites/:token')
  async previewInvite(
    @Param('token') token: string,
  ): Promise<InvitePreviewResponseDto> {
    return this.teamService.getInvitePreview(token);
  }

  @Post('invites/:token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Invite accepted — welcome to the team')
  async acceptNew(
    @Param('token') token: string,
    @Body() dto: AcceptNewInviteDto,
  ) {
    return this.teamService.acceptNew(token, dto.name, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accept')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('Invite accepted — welcome to the team')
  async acceptExisting(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AcceptExistingInviteDto,
  ): Promise<null> {
    await this.teamService.acceptExisting(user.userId, user.email, dto.token);
    return null;
  }

  private assertIsOwner(userId: string, accountId: string): void {
    if (userId !== accountId) {
      throw new ForbiddenException(
        'Only the account owner can manage team members',
      );
    }
  }
}
