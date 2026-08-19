import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

export const NOTIFICATION_TYPES = ['events', 'guests', 'vendors', 'moi', 'ledger'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// Created internally by other services (guest/vendor/ledger/moi) when a
// notify-worthy state change happens — never bound directly from an HTTP
// body, so there's no public CreateNotificationDto.
@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true, enum: NOTIFICATION_TYPES })
  type!: NotificationType;

  @Prop({ required: true, trim: true })
  message!: string;

  // Frontend path to navigate to when the notification is clicked.
  @Prop({ trim: true })
  link?: string;

  @Prop({ type: Boolean, required: true, default: false, index: true })
  read!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, createdAt: -1 });
