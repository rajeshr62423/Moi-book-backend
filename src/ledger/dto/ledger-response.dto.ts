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
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(ledger: LedgerDocument): LedgerResponseDto {
    const doc = ledger as unknown as { createdAt: Date; updatedAt: Date };
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
