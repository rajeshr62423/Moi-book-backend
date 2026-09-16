import { IsEmail } from 'class-validator';

export class InviteTeamMemberDto {
  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;
}
