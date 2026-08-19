import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../event/schemas/event.schema';
import { Guest, GuestDocument } from '../guest/schemas/guest.schema';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';
import { Moi, MoiDocument } from '../moi/schemas/moi.schema';
import { Ledger, LedgerDocument } from '../ledger/schemas/ledger.schema';
import { SearchResultItem } from './dto/search-result.dto';

const RESULTS_PER_TYPE = 5;
const MIN_QUERY_LENGTH = 2;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function currency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
    @InjectModel(Vendor.name) private readonly vendorModel: Model<VendorDocument>,
    @InjectModel(Moi.name) private readonly moiModel: Model<MoiDocument>,
    @InjectModel(Ledger.name) private readonly ledgerModel: Model<LedgerDocument>,
  ) {}

  async search(userId: string, query: string): Promise<SearchResultItem[]> {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      return [];
    }

    const uid = new Types.ObjectId(userId);
    const re = new RegExp(escapeRegex(trimmed), 'i');

    const [events, guests, vendors, moiItems, ledgerItems] = await Promise.all([
      this.eventModel
        .find({ userId: uid, $or: [{ name: re }, { location: re }] })
        .limit(RESULTS_PER_TYPE)
        .exec(),
      this.guestModel
        .find({ userId: uid, $or: [{ name: re }, { phone: re }] })
        .limit(RESULTS_PER_TYPE)
        .exec(),
      this.vendorModel
        .find({ userId: uid, $or: [{ name: re }, { location: re }] })
        .limit(RESULTS_PER_TYPE)
        .exec(),
      this.moiModel
        .find({ userId: uid, $or: [{ giftName: re }, { notes: re }] })
        .limit(RESULTS_PER_TYPE)
        .exec(),
      this.ledgerModel
        .find({ userId: uid, $or: [{ title: re }, { notes: re }] })
        .limit(RESULTS_PER_TYPE)
        .exec(),
    ]);

    // Moi results need the contributing guest's name — fetch just those referenced.
    const moiGuestIds = moiItems.map((m) => m.guestId);
    const moiGuests = moiGuestIds.length
      ? await this.guestModel.find({ _id: { $in: moiGuestIds } }).exec()
      : [];
    const guestNameById = new Map(moiGuests.map((g) => [g._id.toString(), g.name]));

    const results: SearchResultItem[] = [
      ...events.map((e) => ({
        type: 'event' as const,
        id: e._id.toString(),
        title: e.name,
        subtitle: e.location,
        link: '/events',
      })),
      ...guests.map((g) => ({
        type: 'guest' as const,
        id: g._id.toString(),
        title: g.name,
        subtitle: g.phone,
        link: `/guests/${g._id.toString()}`,
      })),
      ...vendors.map((v) => ({
        type: 'vendor' as const,
        id: v._id.toString(),
        title: v.name,
        subtitle: v.location,
        link: '/vendors',
      })),
      ...moiItems.map((m) => ({
        type: 'moi' as const,
        id: m._id.toString(),
        title: guestNameById.get(m.guestId.toString()) ?? 'Moi contribution',
        subtitle: m.type === 'gift' ? m.giftName : currency(m.amount ?? 0),
        link: '/moi',
      })),
      ...ledgerItems.map((l) => ({
        type: 'ledger' as const,
        id: l._id.toString(),
        title: l.title,
        subtitle: currency(l.amount),
        link: '/ledger',
      })),
    ];

    return results;
  }
}
