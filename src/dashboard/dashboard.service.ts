import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from '../event/schemas/event.schema';
import { Guest, GuestDocument } from '../guest/schemas/guest.schema';
import { Vendor, VendorDocument } from '../vendor/schemas/vendor.schema';
import { Moi, MoiDocument } from '../moi/schemas/moi.schema';
import { Ledger, LedgerDocument } from '../ledger/schemas/ledger.schema';
import {
  ActivityEntryDto,
  ActivityIcon,
  DashboardSummaryDto,
} from './dto/dashboard-summary.dto';

function currency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

interface TimestampedDoc {
  createdAt: Date;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
    @InjectModel(Moi.name) private readonly moiModel: Model<MoiDocument>,
    @InjectModel(Ledger.name)
    private readonly ledgerModel: Model<LedgerDocument>,
  ) {}

  async getSummary(userId: string): Promise<DashboardSummaryDto> {
    const uid = new Types.ObjectId(userId);
    const today = new Date().toISOString().slice(0, 10);

    // Guests whose event has already happened shouldn't inflate pendingRsvps —
    // an un-responded invite for a past event is stale, not something to
    // still chase, so it's excluded here rather than counted alongside
    // genuinely-upcoming pending RSVPs.
    const pastEventIds = await this.eventModel.distinct('_id', {
      userId: uid,
      date: { $lt: today },
    });

    const [
      upcomingEventsCount,
      totalGuests,
      pendingRsvps,
      vendorsCount,
      unbookedVendorsCount,
      pendingLedgerEntries,
      budgetAgg,
      paidAgg,
      recentEvents,
      recentGuests,
      recentVendors,
      recentMoi,
      recentLedger,
    ] = await Promise.all([
      this.eventModel.countDocuments({ userId: uid, date: { $gte: today } }),
      this.guestModel.countDocuments({ userId: uid }),
      this.guestModel.countDocuments({
        userId: uid,
        status: 'pending',
        eventId: { $nin: pastEventIds },
      }),
      this.vendorModel.countDocuments({ userId: uid }),
      this.vendorModel.countDocuments({
        userId: uid,
        status: { $ne: 'booked' },
      }),
      this.ledgerModel.find({ userId: uid, status: 'pending' }).exec(),
      this.eventModel.aggregate<{ total: number }>([
        { $match: { userId: uid } },
        { $group: { _id: null, total: { $sum: '$budget' } } },
      ]),
      this.ledgerModel.aggregate<{ total: number }>([
        { $match: { userId: uid, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.eventModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.guestModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.vendorModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.moiModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
      this.ledgerModel
        .find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(5)
        .exec(),
    ]);

    const totalBudget = budgetAgg[0]?.total ?? 0;
    const totalPaid = paidAgg[0]?.total ?? 0;
    const totalPending = pendingLedgerEntries.reduce(
      (sum, e) => sum + e.amount,
      0,
    );
    const totalRemaining = Math.max(0, totalBudget - totalPaid);
    const paidPct =
      totalBudget > 0
        ? Math.min(100, Math.round((totalPaid / totalBudget) * 100))
        : 0;

    // Moi activity text needs guest names — fetch just the guests referenced by recentMoi.
    const moiGuestIds = recentMoi.map((m) => m.guestId);
    const moiGuests = moiGuestIds.length
      ? await this.guestModel.find({ _id: { $in: moiGuestIds } }).exec()
      : [];
    const guestNameById = new Map(
      moiGuests.map((g) => [g._id.toString(), g.name]),
    );

    const activity: ActivityEntryDto[] = [
      ...recentEvents.map((e) =>
        this.toActivity('events', `Event created: ${e.name}`, e),
      ),
      ...recentGuests.map((g) =>
        this.toActivity('guests', `Guest added: ${g.name}`, g),
      ),
      ...recentVendors.map((v) =>
        this.toActivity('vendors', `Vendor added: ${v.name}`, v),
      ),
      ...recentMoi.map((m) => {
        const guestName = guestNameById.get(m.guestId.toString()) ?? 'a guest';
        const kind =
          m.type === 'gift' ? m.giftName || 'a gift' : currency(m.amount ?? 0);
        return this.toActivity(
          'moi',
          `${kind} contribution from ${guestName}`,
          m,
        );
      }),
      ...recentLedger.map((l) =>
        this.toActivity('ledger', `Transaction logged: ${l.title}`, l),
      ),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5);

    return {
      upcomingEventsCount,
      totalGuests,
      pendingRsvps,
      vendorsCount,
      unbookedVendorsCount,
      ledger: { totalBudget, totalPaid, totalPending, totalRemaining, paidPct },
      recentActivity: activity,
    };
  }

  private toActivity(
    icon: ActivityIcon,
    text: string,
    doc: unknown,
  ): ActivityEntryDto {
    return { icon, text, time: (doc as TimestampedDoc).createdAt };
  }
}
