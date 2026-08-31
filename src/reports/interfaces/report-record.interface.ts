export interface ReportRecord {
  eventId: string;
  eventName: string;
  date: string; // yyyy-mm-dd
  guests: number;
  confirmed: number;
  pending: number;
  notAttending: number;
  attendanceRate: number; // 0-100
}

export interface ReportSummary {
  totalEvents: number;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  attendanceRate: number; // 0-100
}
