import {
  MoiDocument,
  MoiGiftCategory,
  MoiGiftUnit,
  MoiPaymentMethod,
  MoiType,
} from '../schemas/moi.schema';

export class MoiResponseDto {
  id?: string;
  guestId!: string;
  eventId!: string;
  type!: MoiType;
  date!: string;
  notes?: string;
  amount?: number;
  method?: MoiPaymentMethod;
  reference?: string;
  giftCategory?: MoiGiftCategory;
  giftName?: string;
  quantity?: number;
  unit?: MoiGiftUnit;
  giftValue?: number;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(moi: MoiDocument): MoiResponseDto {
    const doc = moi as unknown as { createdAt: Date; updatedAt: Date };
    return {
      id: moi._id.toString(),
      guestId: moi.guestId.toString(),
      eventId: moi.eventId.toString(),
      type: moi.type,
      date: moi.date,
      notes: moi.notes,
      amount: moi.amount,
      method: moi.method,
      reference: moi.reference,
      giftCategory: moi.giftCategory,
      giftName: moi.giftName,
      quantity: moi.quantity,
      unit: moi.unit,
      giftValue: moi.giftValue,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
