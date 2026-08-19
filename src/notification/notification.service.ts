import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';

export interface CreateNotificationInput {
  type: NotificationType;
  message: string;
  link?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  create(userId: string, input: CreateNotificationInput): Promise<NotificationDocument> {
    return this.notificationModel.create({
      ...input,
      userId: new Types.ObjectId(userId),
    });
  }

  async listForUser(
    userId: string,
  ): Promise<{ items: NotificationDocument[]; unreadCount: number }> {
    const uid = new Types.ObjectId(userId);
    const [items, unreadCount] = await Promise.all([
      this.notificationModel.find({ userId: uid }).sort({ createdAt: -1 }).limit(20).exec(),
      this.notificationModel.countDocuments({ userId: uid, read: false }).exec(),
    ]);
    return { items, unreadCount };
  }

  async markAsRead(userId: string, id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { read: true },
        { new: true },
      )
      .exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany({ userId: new Types.ObjectId(userId), read: false }, { read: true })
      .exec();
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.notificationModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
  }
}
