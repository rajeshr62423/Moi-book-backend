import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { EVENT_STATUSES, EVENT_TYPES } from '../schemas/event.schema';

export class CreateEventDto {
  @IsString()
  @MinLength(1, { message: 'Event name is required' })
  name!: string;

  @IsIn(EVENT_TYPES, { message: 'Invalid event type' })
  type!: (typeof EVENT_TYPES)[number];

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in yyyy-mm-dd format' })
  date!: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'Time must be in HH:mm format' })
  time!: string;

  @IsInt()
  @Min(0)
  guests!: number;

  @IsString()
  @MinLength(1, { message: 'Location is required' })
  location!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budget?: number;

  @IsOptional()
  @IsString()
  description?: string;

  // Cloudinary URL, returned by POST /uploads and passed through as-is.
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'Thumbnail URL is too long' })
  thumbnail?: string;

  @IsOptional()
  @IsIn(EVENT_STATUSES, { message: 'Invalid event status' })
  status?: (typeof EVENT_STATUSES)[number];
}
