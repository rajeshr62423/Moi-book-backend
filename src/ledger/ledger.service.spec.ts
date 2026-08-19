import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LedgerService } from './ledger.service';
import { Ledger } from './schemas/ledger.schema';
import { NotificationService } from '../notification/notification.service';

const USER_ID = '507f1f77bcf86cd799439011';

describe('LedgerService', () => {
  let service: LedgerService;
  let model: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    deleteOne: jest.Mock;
  };
  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: getModelToken(Ledger.name), useValue: model },
        { provide: NotificationService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
    notificationService = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('notifies when a new entry is created already paid', async () => {
      model.create.mockResolvedValue({ title: 'Catering', amount: 5000, status: 'paid' });

      await service.create(USER_ID, { status: 'paid' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).toHaveBeenCalledWith(USER_ID, {
        type: 'ledger',
        message: 'Payment logged: Catering (₹5000)',
        link: '/ledger',
      });
    });

    it('does not notify when a new entry is pending', async () => {
      model.create.mockResolvedValue({ title: 'Catering', amount: 5000, status: 'pending' });

      await service.create(USER_ID, { status: 'pending' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('notifies when a pending entry transitions to paid', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'pending' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ title: 'Catering', amount: 5000, status: 'paid' }),
      });

      await service.update(USER_ID, 'ledger-1', { status: 'paid' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).toHaveBeenCalledWith(USER_ID, {
        type: 'ledger',
        message: 'Payment logged: Catering (₹5000)',
        link: '/ledger',
      });
    });

    it('does not notify for a paid -> pending transition', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'paid' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ title: 'Catering', amount: 5000, status: 'pending' }),
      });

      await service.update(USER_ID, 'ledger-1', { status: 'pending' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).not.toHaveBeenCalled();
    });
  });
});
