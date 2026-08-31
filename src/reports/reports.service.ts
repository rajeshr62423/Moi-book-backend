import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { QueryFilter } from 'mongoose';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { Event, EventDocument } from '../event/schemas/event.schema';
import {
  Guest,
  GuestDocument,
  GuestStatus,
} from '../guest/schemas/guest.schema';
import { ApiMeta } from '../common/interfaces/api-response.interface';
import { paginate } from '../common/interfaces/paginated.interface';
import { ReportFilterDto, ReportType } from './dto/report-filter.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import {
  ReportRecord,
  ReportSummary,
} from './interfaces/report-record.interface';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  eventSummary: 'Event Summary',
  guestReport: 'Guest Report',
  attendanceReport: 'Attendance Report',
  eventActivity: 'Event Activity',
};

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Guest.name) private readonly guestModel: Model<GuestDocument>,
  ) {}

  private buildEventFilter(
    userId: string,
    filters: ReportFilterDto,
  ): QueryFilter<EventDocument> {
    const filter: QueryFilter<EventDocument> = {
      userId: new Types.ObjectId(userId),
    };
    if (filters.event_id) {
      filter._id = new Types.ObjectId(filters.event_id);
    }
    if (filters.date_from || filters.date_to) {
      filter.date = {};
      if (filters.date_from) filter.date.$gte = filters.date_from;
      if (filters.date_to) filter.date.$lte = filters.date_to;
    }
    return filter;
  }

  private async buildRecords(events: EventDocument[]): Promise<ReportRecord[]> {
    if (events.length === 0) return [];

    const eventIds = events.map((event) => event._id);
    const counts = await this.guestModel.aggregate<{
      _id: { eventId: Types.ObjectId; status: GuestStatus };
      count: number;
    }>([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: { eventId: '$eventId', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    const countsByEvent = new Map<string, Record<GuestStatus, number>>();
    for (const row of counts) {
      const key = row._id.eventId.toString();
      const entry = countsByEvent.get(key) ?? {
        attending: 0,
        pending: 0,
        notattending: 0,
      };
      entry[row._id.status] = row.count;
      countsByEvent.set(key, entry);
    }

    return events.map((event) => {
      const c = countsByEvent.get(event._id.toString()) ?? {
        attending: 0,
        pending: 0,
        notattending: 0,
      };
      const guests = c.attending + c.pending + c.notattending;
      const attendanceRate =
        guests > 0 ? Math.round((c.attending / guests) * 100) : 0;
      return {
        eventId: event._id.toString(),
        eventName: event.name,
        date: event.date,
        guests,
        confirmed: c.attending,
        pending: c.pending,
        notAttending: c.notattending,
        attendanceRate,
      };
    });
  }

  private summarize(records: ReportRecord[]): ReportSummary {
    const totalEvents = records.length;
    const totalGuests = records.reduce((sum, r) => sum + r.guests, 0);
    const confirmedGuests = records.reduce((sum, r) => sum + r.confirmed, 0);
    const pendingGuests = records.reduce((sum, r) => sum + r.pending, 0);
    const attendanceRate =
      totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;
    return {
      totalEvents,
      totalGuests,
      confirmedGuests,
      pendingGuests,
      attendanceRate,
    };
  }

  private async findAllForFilters(
    userId: string,
    filters: ReportFilterDto,
  ): Promise<{ records: ReportRecord[]; summary: ReportSummary }> {
    const filter = this.buildEventFilter(userId, filters);
    const events = await this.eventModel.find(filter).sort({ date: -1 }).exec();
    const records = await this.buildRecords(events);
    const summary = this.summarize(records);
    return { records, summary };
  }

  async getRecords(
    userId: string,
    query: ReportQueryDto,
  ): Promise<{
    records: ReportRecord[];
    summary: ReportSummary;
    meta: ApiMeta;
  }> {
    const { records: allRecords, summary } = await this.findAllForFilters(
      userId,
      query,
    );
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 20;
    const start = (page - 1) * perPage;
    const records = allRecords.slice(start, start + perPage);
    const { meta } = paginate(records, page, perPage, allRecords.length);
    return { records, summary, meta };
  }

  async getRecordsForExport(
    userId: string,
    filters: ReportFilterDto,
  ): Promise<{ records: ReportRecord[]; summary: ReportSummary }> {
    return this.findAllForFilters(userId, filters);
  }

  async buildExcelBuffer(
    records: ReportRecord[],
    summary: ReportSummary,
    reportType: ReportType,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    sheet.addRow([REPORT_TYPE_LABELS[reportType]]).font = {
      bold: true,
      size: 14,
    };
    sheet.addRow([]);
    sheet.addRow(['Total Events', summary.totalEvents]);
    sheet.addRow(['Total Guests', summary.totalGuests]);
    sheet.addRow(['Confirmed Guests', summary.confirmedGuests]);
    sheet.addRow(['Pending Guests', summary.pendingGuests]);
    sheet.addRow(['Attendance Rate', `${summary.attendanceRate}%`]);
    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Event',
      'Date',
      'Guests',
      'Confirmed',
      'Pending',
      'Not Attending',
      'Attendance Rate',
    ]);
    headerRow.font = { bold: true };

    for (const r of records) {
      sheet.addRow([
        r.eventName,
        r.date,
        r.guests,
        r.confirmed,
        r.pending,
        r.notAttending,
        `${r.attendanceRate}%`,
      ]);
    }

    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  buildPdfBuffer(
    records: ReportRecord[],
    summary: ReportSummary,
    reportType: ReportType,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(18)
        .text(REPORT_TYPE_LABELS[reportType], { align: 'center' });
      doc.moveDown();

      doc.fontSize(11);
      doc.text(`Total Events: ${summary.totalEvents}`);
      doc.text(`Total Guests: ${summary.totalGuests}`);
      doc.text(`Confirmed Guests: ${summary.confirmedGuests}`);
      doc.text(`Pending Guests: ${summary.pendingGuests}`);
      doc.text(`Attendance Rate: ${summary.attendanceRate}%`);
      doc.moveDown();

      const columns = [
        { label: 'Event', width: 150 },
        { label: 'Date', width: 75 },
        { label: 'Guests', width: 55 },
        { label: 'Confirmed', width: 65 },
        { label: 'Pending', width: 60 },
        { label: 'Not Att.', width: 60 },
        { label: 'Rate', width: 45 },
      ];
      const startX = doc.page.margins.left;
      const rowHeight = 20;

      function drawRow(values: string[], y: number, bold: boolean) {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
        let x = startX;
        values.forEach((value, i) => {
          doc.text(value, x, y, { width: columns[i].width, ellipsis: true });
          x += columns[i].width;
        });
      }

      let y = doc.y;
      drawRow(
        columns.map((c) => c.label),
        y,
        true,
      );
      y += rowHeight;
      doc
        .moveTo(startX, y - 4)
        .lineTo(startX + columns.reduce((sum, c) => sum + c.width, 0), y - 4)
        .stroke();

      for (const r of records) {
        if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
          doc.addPage();
          y = doc.page.margins.top;
        }
        drawRow(
          [
            r.eventName,
            r.date,
            String(r.guests),
            String(r.confirmed),
            String(r.pending),
            String(r.notAttending),
            `${r.attendanceRate}%`,
          ],
          y,
          false,
        );
        y += rowHeight;
      }

      doc.end();
    });
  }
}
