import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DashboardService } from './dashboard.service';
import { Event } from '../event/schemas/event.schema';
import { Guest } from '../guest/schemas/guest.schema';
import { Vendor } from '../vendor/schemas/vendor.schema';
import { Moi } from '../moi/schemas/moi.schema';
import { Ledger } from '../ledger/schemas/ledger.schema';

function chainable<T>(result: T) {
  return {
    sort: () => chainable(result),
    limit: () => chainable(result),
    exec: () => Promise.resolve(result),
  };
}

function mockModel() {
  return {
    countDocuments: jest.fn().mockResolvedValue(0),
    find: jest.fn().mockReturnValue(chainable([])),
    aggregate: jest.fn().mockResolvedValue([]),
    distinct: jest.fn().mockResolvedValue([]),
  };
}

describe('DashboardService', () => {
  let service: DashboardService;
  let eventModel: ReturnType<typeof mockModel>;
  let guestModel: ReturnType<typeof mockModel>;

  beforeEach(async () => {
    eventModel = mockModel();
    guestModel = mockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Event.name), useValue: eventModel },
        { provide: getModelToken(Guest.name), useValue: guestModel },
        { provide: getModelToken(Vendor.name), useValue: mockModel() },
        { provide: getModelToken(Moi.name), useValue: mockModel() },
        { provide: getModelToken(Ledger.name), useValue: mockModel() },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('excludes guests belonging to past events from pendingRsvps', async () => {
    const pastEventId = new Types.ObjectId();
    eventModel.distinct.mockResolvedValue([pastEventId]);

    await service.getSummary(new Types.ObjectId().toString());

    const today = new Date().toISOString().slice(0, 10);
    const distinctArgs = eventModel.distinct.mock.calls[0] as [
      string,
      { date: { $lt: string } },
    ];
    expect(distinctArgs[0]).toBe('_id');
    expect(distinctArgs[1].date).toEqual({ $lt: today });

    const calls = guestModel.countDocuments.mock.calls as [
      Record<string, unknown>,
    ][];
    const pendingCountCall = calls.find(
      ([filter]) => filter.status === 'pending',
    );
    expect(pendingCountCall).toBeDefined();
    expect(pendingCountCall?.[0]).toMatchObject({
      status: 'pending',
      eventId: { $nin: [pastEventId] },
    });
  });
});
