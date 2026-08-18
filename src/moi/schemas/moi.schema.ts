import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MoiDocument = HydratedDocument<Moi>;

export const MOI_TYPES = ['money', 'gift'] as const;
export type MoiType = (typeof MOI_TYPES)[number];

export const MOI_PAYMENT_METHODS = ['cash', 'upi', 'bank', 'cheque', 'other'] as const;
export type MoiPaymentMethod = (typeof MOI_PAYMENT_METHODS)[number];

export const MOI_GIFT_CATEGORIES = [
  'clothes',
  'gold',
  'silver',
  'jewellery',
  'household',
  'electronics',
  'vouchers',
  'giftcards',
  'other',
] as const;
export type MoiGiftCategory = (typeof MOI_GIFT_CATEGORIES)[number];

export const MOI_GIFT_UNITS = ['pieces', 'grams', 'items', 'kg'] as const;
export type MoiGiftUnit = (typeof MOI_GIFT_UNITS)[number];

@Schema({ timestamps: true })
export class Moi {
  // Moi records are private to whoever recorded them.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Guest', required: true, index: true })
  guestId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: MOI_TYPES })
  type!: MoiType;

  // ISO yyyy-mm-dd
  @Prop({ required: true })
  date!: string;

  @Prop({ trim: true })
  notes?: string;

  // Money contribution fields
  @Prop({ min: 0 })
  amount?: number;

  @Prop({ type: String, enum: MOI_PAYMENT_METHODS })
  method?: MoiPaymentMethod;

  @Prop({ trim: true })
  reference?: string;

  // Gift contribution fields
  @Prop({ type: String, enum: MOI_GIFT_CATEGORIES })
  giftCategory?: MoiGiftCategory;

  @Prop({ trim: true })
  giftName?: string;

  @Prop({ min: 0 })
  quantity?: number;

  @Prop({ type: String, enum: MOI_GIFT_UNITS })
  unit?: MoiGiftUnit;

  @Prop({ min: 0 })
  giftValue?: number;
}

export const MoiSchema = SchemaFactory.createForClass(Moi);
