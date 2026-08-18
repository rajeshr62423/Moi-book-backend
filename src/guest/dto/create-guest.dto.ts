import { IsEmail, IsIn, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { GUEST_GROUPS, GUEST_STATUSES } from '../schemas/guest.schema';

export class CreateGuestDto {
  @IsString()
  @MinLength(1, { message: 'Guest name is required' })
  name!: string;

  @IsIn(GUEST_GROUPS, { message: 'Invalid group' })
  group!: (typeof GUEST_GROUPS)[number];

  @IsString()
  @MinLength(1, { message: 'Phone number is required' })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email' })
  email?: string;

  @IsMongoId({ message: 'A valid event is required' })
  eventId!: string;

  @IsOptional()
  @IsIn(GUEST_STATUSES, { message: 'Invalid RSVP status' })
  status?: (typeof GUEST_STATUSES)[number];
}
