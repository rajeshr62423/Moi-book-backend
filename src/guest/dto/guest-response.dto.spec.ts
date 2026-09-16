import { Types } from 'mongoose';
import { GuestResponseDto } from './guest-response.dto';
import { GuestDocument } from '../schemas/guest.schema';

function fakeGuest(overrides: Partial<GuestDocument>): GuestDocument {
  return {
    _id: new Types.ObjectId(),
    name: 'Aunt Priya',
    group: 'family',
    phone: '9999999999',
    eventId: new Types.ObjectId(),
    status: 'pending',
    ...overrides,
  } as unknown as GuestDocument;
}

describe('GuestResponseDto.fromDocument', () => {
  it('flags rsvpOverdue when still pending and the event date has passed', () => {
    const dto = GuestResponseDto.fromDocument(
      fakeGuest({ status: 'pending' }),
      '2000-01-01',
    );
    expect(dto.rsvpOverdue).toBe(true);
  });

  it('does not flag a pending guest whose event is still upcoming', () => {
    const dto = GuestResponseDto.fromDocument(
      fakeGuest({ status: 'pending' }),
      '2999-01-01',
    );
    expect(dto.rsvpOverdue).toBe(false);
  });

  it('does not flag a guest who already responded, even for a past event', () => {
    const dto = GuestResponseDto.fromDocument(
      fakeGuest({ status: 'attending' }),
      '2000-01-01',
    );
    expect(dto.rsvpOverdue).toBe(false);
  });

  it('does not flag when the event date is unavailable', () => {
    const dto = GuestResponseDto.fromDocument(
      fakeGuest({ status: 'pending' }),
      undefined,
    );
    expect(dto.rsvpOverdue).toBe(false);
  });
});
