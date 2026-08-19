import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GuestService } from './guest.service';
import { Guest } from './schemas/guest.schema';
import { NotificationService } from '../notification/notification.service';

const USER_ID = '507f1f77bcf86cd799439011';

describe('GuestService', () => {
  let service: GuestService;
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
        GuestService,
        { provide: getModelToken(Guest.name), useValue: model },
        { provide: NotificationService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<GuestService>(GuestService);
    notificationService = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('creates a notification when the RSVP status changes', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'pending' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Priya', status: 'attending' }),
      });

      await service.update(USER_ID, 'guest-1', { status: 'attending' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).toHaveBeenCalledWith(USER_ID, {
        type: 'guests',
        message: "Priya RSVP'd as attending",
        link: '/guests',
      });
    });

    it('does not notify when the status is unchanged', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'attending' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Priya', status: 'attending' }),
      });

      await service.update(USER_ID, 'guest-1', { status: 'attending' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).not.toHaveBeenCalled();
    });

    it('does not notify when the dto has no status field', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ status: 'pending' }) });
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Priya', status: 'pending' }),
      });

      await service.update(USER_ID, 'guest-1', { phone: '999' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).not.toHaveBeenCalled();
    });
  });
});
