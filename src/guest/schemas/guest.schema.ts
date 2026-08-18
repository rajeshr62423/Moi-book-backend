import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GuestDocument = HydratedDocument<Guest>;

export const GUEST_GROUPS = ['family', 'friends', 'colleagues', 'relatives'] as const;
export type GuestGroup = (typeof GUEST_GROUPS)[number];

export const GUEST_STATUSES = ['attending', 'notattending', 'pending'] as const;
export type GuestStatus = (typeof GUEST_STATUSES)[number];

@Schema({ timestamps: true })
export class Guest {
  // Guests are private to whoever added them.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, enum: GUEST_GROUPS })
  group!: GuestGroup;

  @Prop({ required: true, trim: true })
  phone!: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true })
  eventId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: GUEST_STATUSES, default: 'pending' })
  status!: GuestStatus;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
