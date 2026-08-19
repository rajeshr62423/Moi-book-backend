import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LedgerDocument = HydratedDocument<Ledger>;

export const LEDGER_CATEGORIES = [
  'catering',
  'venue',
  'photography',
  'decoration',
  'entertainment',
  'transport',
  'others',
] as const;
export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number];

export const LEDGER_TYPES = ['income', 'expense'] as const;
export type LedgerType = (typeof LEDGER_TYPES)[number];

export const LEDGER_STATUSES = ['paid', 'pending'] as const;
export type LedgerStatus = (typeof LEDGER_STATUSES)[number];

@Schema({ timestamps: true })
export class Ledger {
  // Ledger entries are private to whoever recorded them.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId!: Types.ObjectId;

  // Optional: not every payment is tied to a specific vendor.
  @Prop({ type: Types.ObjectId, ref: 'Vendor' })
  vendorId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: String, required: true, enum: LEDGER_CATEGORIES })
  category!: LedgerCategory;

  @Prop({ type: String, required: true, enum: LEDGER_TYPES, default: 'expense' })
  type!: LedgerType;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ type: String, required: true, enum: LEDGER_STATUSES, default: 'pending' })
  status!: LedgerStatus;

  // ISO yyyy-mm-dd
  @Prop({ required: true })
  date!: string;

  @Prop({ trim: true })
  notes?: string;
}

export const LedgerSchema = SchemaFactory.createForClass(Ledger);
