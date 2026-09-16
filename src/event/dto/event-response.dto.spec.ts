import { Types } from 'mongoose';
import { EventResponseDto } from './event-response.dto';
import { EventDocument } from '../schemas/event.schema';

function fakeEvent(overrides: Partial<EventDocument>): EventDocument {
  return {
    _id: new Types.ObjectId(),
    name: 'Wedding',
    type: 'wedding',
    date: '2000-01-01',
    time: '18:00',
    guests: 100,
    location: 'Chennai',
    status: 'confirmed',
    ...overrides,
  } as unknown as EventDocument;
}

describe('EventResponseDto.fromDocument', () => {
  it('reports the stored status when the event date is in the future', () => {
    const dto = EventResponseDto.fromDocument(
      fakeEvent({ date: '2999-01-01', status: 'planning' }),
    );
    expect(dto.status).toBe('planning');
  });

  it('reports "completed" once the event date has passed, regardless of stored status', () => {
    const dto = EventResponseDto.fromDocument(
      fakeEvent({ date: '2000-01-01', status: 'confirmed' }),
    );
    expect(dto.status).toBe('completed');
  });
});
