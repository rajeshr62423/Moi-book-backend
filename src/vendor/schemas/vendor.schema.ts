import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VendorDocument = HydratedDocument<Vendor>;

export const VENDOR_CATEGORIES = [
  'catering',
  'venue',
  'photography',
  'decoration',
  'entertainment',
  'transport',
  'others',
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_STATUSES = [
  'shortlisted',
  'contacted',
  'quotation',
  'booked',
] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

@Schema({ timestamps: true })
export class Vendor {
  // Vendors are private to whoever added them.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, enum: VENDOR_CATEGORIES })
  category!: VendorCategory;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  location!: string;

  // Cloudinary URL (uploaded via POST /uploads before the vendor is saved).
  @Prop()
  thumbnail?: string;

  @Prop({ type: String, required: true, enum: VENDOR_STATUSES, default: 'shortlisted' })
  status!: VendorStatus;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);
