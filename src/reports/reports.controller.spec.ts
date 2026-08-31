import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import request from 'supertest';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Event } from '../event/schemas/event.schema';
import { Guest } from '../guest/schemas/guest.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const userId = new Types.ObjectId();
const event1Id = new Types.ObjectId();
const event2Id = new Types.ObjectId();

const fakeEvents = [
  { _id: event1Id, name: 'Wedding', date: '2026-01-10' },
  { _id: event2Id, name: 'Birthday', date: '2026-02-15' },
];

const fakeGuestCounts = [
  { _id: { eventId: event1Id, status: 'attending' }, count: 3 },
  { _id: { eventId: event1Id, status: 'pending' }, count: 2 },
  { _id: { eventId: event2Id, status: 'attending' }, count: 5 },
  { _id: { eventId: event2Id, status: 'notattending' }, count: 1 },
];

describe('ReportsController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        {
          provide: getModelToken(Event.name),
          useValue: {
            find: () => ({
              sort: () => ({ exec: () => Promise.resolve(fakeEvents) }),
            }),
          },
        },
        {
          provide: getModelToken(Guest.name),
          useValue: {
            aggregate: () => Promise.resolve(fakeGuestCounts),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: import('@nestjs/common').ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: userId.toString() };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /reports returns the correct envelope shape and math', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports')
      .query({ report_type: 'eventSummary', page: 1, per_page: 20 });

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('success');
    expect(res.body.data.records).toHaveLength(2);
    expect(res.body.data.records[0]).toMatchObject({
      eventName: 'Wedding',
      guests: 5,
      confirmed: 3,
      pending: 2,
      notAttending: 0,
      attendanceRate: 60,
    });
    expect(res.body.data.records[1]).toMatchObject({
      eventName: 'Birthday',
      guests: 6,
      confirmed: 5,
      pending: 0,
      notAttending: 1,
      attendanceRate: 83,
    });
    expect(res.body.data.summary).toEqual({
      totalEvents: 2,
      totalGuests: 11,
      confirmedGuests: 8,
      pendingGuests: 2,
      attendanceRate: 73,
    });
    expect(res.body.meta).toMatchObject({
      total_records: 2,
      current_page: 1,
      per_page: 20,
      count: 2,
      has_next_page: false,
      has_prev_page: false,
    });
  });

  it('rejects an invalid report_type', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports')
      .query({ report_type: 'bogus' });
    expect(res.status).toBe(400);
  });

  it('GET /reports/export/excel returns a valid, parseable xlsx', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports/export/excel')
      .query({ report_type: 'guestReport' })
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain('.xlsx');

    const buf = res.body as Buffer;
    // xlsx is a zip archive — starts with the local file header signature "PK".
    expect(buf.subarray(0, 2).toString()).toBe('PK');
    expect(buf.length).toBeGreaterThan(100);
  });

  it('GET /reports/export/pdf returns a valid PDF buffer', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports/export/pdf')
      .query({ report_type: 'attendanceReport' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('.pdf');
    const buf = res.body as Buffer;
    expect(buf.subarray(0, 4).toString()).toBe('%PDF');
  });
});
