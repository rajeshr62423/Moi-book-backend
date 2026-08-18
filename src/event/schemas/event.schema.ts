import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

export const EVENT_TYPES = [
  'wedding',
  'birthday',
  'anniversary',
  'corporate',
  'family',
  'other',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_STATUSES = ['planning', 'confirmed', 'savedate'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

@Schema({ timestamps: true })
export class Event {
  // Events are private to whoever created them.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, required: true, enum: EVENT_TYPES })
  type!: EventType;

  // ISO yyyy-mm-dd, kept as a string so the date the host picked round-trips
  // without timezone drift.
  @Prop({ required: true })
  date!: string;

  // HH:mm
  @Prop({ required: true })
  time!: string;

  @Prop({ required: true, min: 0 })
  guests!: number;

  @Prop({ required: true, trim: true })
  location!: string;

  @Prop({ min: 0 })
  budget?: number;

  @Prop({ trim: true })
  description?: string;

  // Cloudinary URL (uploaded via POST /uploads before the event is saved).
  @Prop()
  thumbnail?: string;

  @Prop({ type: String, required: true, enum: EVENT_STATUSES, default: 'planning' })
  status!: EventStatus;
}

export const EventSchema = SchemaFactory.createForClass(Event);
