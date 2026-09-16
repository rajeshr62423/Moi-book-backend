import { IsString, MinLength } from 'class-validator';

export class AcceptExistingInviteDto {
  @IsString()
  @MinLength(1, { message: 'Invite token is required' })
  token!: string;
}
