import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { Event } from '../event/schemas/event.schema';
import { Guest } from '../guest/schemas/guest.schema';
import { Vendor } from '../vendor/schemas/vendor.schema';
import { Moi } from '../moi/schemas/moi.schema';
import { Ledger } from '../ledger/schemas/ledger.schema';

function mockModel() {
  return {
    countDocuments: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };
}

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getModelToken(Event.name), useValue: mockModel() },
        { provide: getModelToken(Guest.name), useValue: mockModel() },
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
});
