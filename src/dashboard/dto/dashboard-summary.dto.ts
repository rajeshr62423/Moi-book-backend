export type ActivityIcon = 'events' | 'guests' | 'vendors' | 'moi' | 'ledger';

export class ActivityEntryDto {
  icon!: ActivityIcon;
  text!: string;
  time!: Date;
}

export class LedgerSummaryDto {
  totalBudget!: number;
  totalPaid!: number;
  totalPending!: number;
  totalRemaining!: number;
  paidPct!: number;
}

export class DashboardSummaryDto {
  upcomingEventsCount!: number;
  totalGuests!: number;
  pendingRsvps!: number;
  vendorsCount!: number;
  unbookedVendorsCount!: number;
  ledger!: LedgerSummaryDto;
  recentActivity!: ActivityEntryDto[];
}
