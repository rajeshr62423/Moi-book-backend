import { EventDocument, EventStatus, EventType } from '../schemas/event.schema';

// 'completed' is never persisted — CreateEventDto/UpdateEventDto still only
// accept EVENT_STATUSES. It's derived at read-time below, purely for API
// responses, so the planning-stage value stored in Mongo is untouched.
export type EventLifecycleStatus = EventStatus | 'completed';

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
  status!: EventLifecycleStatus;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(event: EventDocument): EventResponseDto {
    const doc = event as unknown as { createdAt: Date; updatedAt: Date };
    const today = new Date().toISOString().slice(0, 10);
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
      status: event.date < today ? 'completed' : event.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
