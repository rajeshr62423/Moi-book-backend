import { IsString, Matches, MinLength } from 'class-validator';

export class AcceptNewInviteDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  // Mirrors RegisterDto's rule (and the frontend's lib/authValidation.ts):
  // at least 8 characters, one uppercase letter, one number.
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain a number' })
  password!: string;
}
