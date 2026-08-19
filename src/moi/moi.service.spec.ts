import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MoiService } from './moi.service';
import { Moi } from './schemas/moi.schema';
import { NotificationService } from '../notification/notification.service';

const USER_ID = '507f1f77bcf86cd799439011';

describe('MoiService', () => {
  let service: MoiService;
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
        MoiService,
        { provide: getModelToken(Moi.name), useValue: model },
        { provide: NotificationService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
      ],
    }).compile();

    service = module.get<MoiService>(MoiService);
    notificationService = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('notifies with the amount for a money contribution', async () => {
      model.create.mockResolvedValue({ type: 'money', amount: 500 });

      await service.create(USER_ID, { type: 'money', amount: 500 } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).toHaveBeenCalledWith(USER_ID, {
        type: 'moi',
        message: 'New money contribution recorded (₹500)',
        link: '/moi',
      });
    });

    it('notifies with the gift name for a gift contribution', async () => {
      model.create.mockResolvedValue({ type: 'gift', giftName: 'Silver plate' });

      await service.create(USER_ID, { type: 'gift', giftName: 'Silver plate' } as never);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(notificationService.create).toHaveBeenCalledWith(USER_ID, {
        type: 'moi',
        message: 'New gift contribution recorded (Silver plate)',
        link: '/moi',
      });
    });
  });
});
