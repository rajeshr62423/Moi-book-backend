import { EventDocument, EventStatus, EventType } from '../schemas/event.schema';

export class EventResponseDto {
  id?: string;
  name!: string;
  type!: EventType;
  date!: string;
  time!: string;
  guests!: number;
  location!: string;
  budget?: number;
  description?: string;
  thumbnail?: string;
  status!: EventStatus;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(event: EventDocument): EventResponseDto {
    const doc = event as unknown as { createdAt: Date; updatedAt: Date };
    return {
      id: event._id.toString(),
      name: event.name,
      type: event.type,
      date: event.date,
      time: event.time,
      guests: event.guests,
      location: event.location,
      budget: event.budget,
      description: event.description,
      thumbnail: event.thumbnail,
      status: event.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
