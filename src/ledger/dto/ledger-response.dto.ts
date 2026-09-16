import {
  LedgerCategory,
  LedgerDocument,
  LedgerStatus,
  LedgerType,
} from '../schemas/ledger.schema';

export class LedgerResponseDto {
  id?: string;
  eventId!: string;
  vendorId?: string;
  title!: string;
  category!: LedgerCategory;
  type!: LedgerType;
  amount!: number;
  status!: LedgerStatus;
  date!: string;
  notes?: string;
  // True when this entry is still pending and its date has already passed —
  // distinguishes a late payment from one that's merely not due yet.
  overdue!: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(ledger: LedgerDocument): LedgerResponseDto {
    const doc = ledger as unknown as { createdAt: Date; updatedAt: Date };
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: ledger._id.toString(),
      eventId: ledger.eventId.toString(),
      vendorId: ledger.vendorId?.toString(),
      title: ledger.title,
      category: ledger.category,
      type: ledger.type,
      amount: ledger.amount,
      status: ledger.status,
      date: ledger.date,
      notes: ledger.notes,
      overdue: ledger.status === 'pending' && ledger.date < today,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
