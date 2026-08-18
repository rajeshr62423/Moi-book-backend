import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { VENDOR_CATEGORIES, VENDOR_STATUSES } from '../schemas/vendor.schema';

export class CreateVendorDto {
  @IsString()
  @MinLength(1, { message: 'Vendor name is required' })
  name!: string;

  @IsIn(VENDOR_CATEGORIES, { message: 'Invalid vendor category' })
  category!: (typeof VENDOR_CATEGORIES)[number];

  @IsString()
  @MinLength(1, { message: 'Phone number is required' })
  phone!: string;

  @IsString()
  @MinLength(1, { message: 'Location is required' })
  location!: string;

  // Cloudinary URL, returned by POST /uploads and passed through as-is.
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'Thumbnail URL is too long' })
  thumbnail?: string;

  @IsOptional()
  @IsIn(VENDOR_STATUSES, { message: 'Invalid vendor status' })
  status?: (typeof VENDOR_STATUSES)[number];
}
