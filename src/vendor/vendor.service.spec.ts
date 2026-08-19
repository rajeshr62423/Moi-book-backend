import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { VendorService } from './vendor.service';
import { Vendor } from './schemas/vendor.schema';
import { NotificationService } from '../notification/notification.service';

const USER_ID = '507f1f77bcf86cd799439011';

describe('VendorService', () => {
  let service: VendorService;
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
        VendorService,
        { provide: getModelToken(Vendor.name), useValue: model },
        { provide: NotificationService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
    notificationService = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('creates a notification when a vendor is confirmed as booked', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'shortlisted' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Moments Studio', status: 'booked' }),
      });

      await service.update(USER_ID, 'vendor-1', { status: 'booked' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).toHaveBeenCalledWith(USER_ID, {
        type: 'vendors',
        message: 'Moments Studio confirmed as booked',
        link: '/vendors',
      });
    });

    it('does not notify for a non-booked transition', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'shortlisted' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Moments Studio', status: 'contacted' }),
      });

      await service.update(USER_ID, 'vendor-1', { status: 'contacted' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).not.toHaveBeenCalled();
    });

    it('does not notify when already booked and re-saved as booked', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'booked' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Moments Studio', status: 'booked' }),
      });

      await service.update(USER_ID, 'vendor-1', { status: 'booked' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).not.toHaveBeenCalled();
    });
  });
});
