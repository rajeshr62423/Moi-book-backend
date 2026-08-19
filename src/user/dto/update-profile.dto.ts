import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Cloudinary URL, returned by POST /uploads and passed through as-is.
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'Avatar URL is too long' })
  avatar?: string;
}
