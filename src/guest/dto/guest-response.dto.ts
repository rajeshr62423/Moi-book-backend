import { GuestDocument, GuestGroup, GuestStatus } from '../schemas/guest.schema';

export class GuestResponseDto {
  id?: string;
  name!: string;
  group!: GuestGroup;
  phone!: string;
  email?: string;
  eventId!: string;
  status!: GuestStatus;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(guest: GuestDocument): GuestResponseDto {
    const doc = guest as unknown as { createdAt: Date; updatedAt: Date };
    return {
      id: guest._id.toString(),
      name: guest.name,
      group: guest.group,
      phone: guest.phone,
      email: guest.email,
      eventId: guest.eventId.toString(),
      status: guest.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
