import { Types } from 'mongoose';
import { LedgerResponseDto } from './ledger-response.dto';
import { LedgerDocument } from '../schemas/ledger.schema';

function fakeLedger(overrides: Partial<LedgerDocument>): LedgerDocument {
  return {
    _id: new Types.ObjectId(),
    eventId: new Types.ObjectId(),
    title: 'Catering advance',
    category: 'catering',
    type: 'expense',
    amount: 5000,
    status: 'pending',
    date: '2000-01-01',
    ...overrides,
  } as unknown as LedgerDocument;
}

describe('LedgerResponseDto.fromDocument', () => {
  it('flags overdue when still pending and the due date has passed', () => {
    const dto = LedgerResponseDto.fromDocument(
      fakeLedger({ status: 'pending', date: '2000-01-01' }),
    );
    expect(dto.overdue).toBe(true);
  });

  it('does not flag a pending entry that is not yet due', () => {
    const dto = LedgerResponseDto.fromDocument(
      fakeLedger({ status: 'pending', date: '2999-01-01' }),
    );
    expect(dto.overdue).toBe(false);
  });

  it('does not flag a paid entry, even past its date', () => {
    const dto = LedgerResponseDto.fromDocument(
      fakeLedger({ status: 'paid', date: '2000-01-01' }),
    );
    expect(dto.overdue).toBe(false);
  });
});
