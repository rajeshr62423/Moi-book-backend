import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Mirrors the frontend's client-side rule (lib/authValidation.ts):
  // at least 8 characters, one uppercase letter, one number.
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain a number' })
  password!: string;
}
