import {
  GuestDocument,
  GuestGroup,
  GuestStatus,
} from '../schemas/guest.schema';

export class GuestResponseDto {
  id?: string;
  name!: string;
  group!: GuestGroup;
  phone!: string;
  email?: string;
  eventId!: string;
  status!: GuestStatus;
  // True when this guest never responded and the event's date has already
  // passed — distinguishes a stale, unresolved RSVP from one that's still
  // genuinely upcoming. Requires the event's date, since Guest doesn't carry
  // one itself; callers without it (rare) get `false`.
  rsvpOverdue!: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(
    guest: GuestDocument,
    eventDate?: string,
  ): GuestResponseDto {
    const doc = guest as unknown as { createdAt: Date; updatedAt: Date };
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: guest._id.toString(),
      name: guest.name,
      group: guest.group,
      phone: guest.phone,
      email: guest.email,
      eventId: guest.eventId.toString(),
      status: guest.status,
      rsvpOverdue:
        guest.status === 'pending' && !!eventDate && eventDate < today,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
