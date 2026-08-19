import { NotificationDocument, NotificationType } from '../schemas/notification.schema';

/** Public shape of a Notification document. */
export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;

  static fromDocument(notification: NotificationDocument): NotificationResponseDto {
    return {
      id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      createdAt: (notification as unknown as { createdAt: Date }).createdAt,
    };
  }
}

export class NotificationListResponseDto {
  items: NotificationResponseDto[];
  unreadCount: number;
}
