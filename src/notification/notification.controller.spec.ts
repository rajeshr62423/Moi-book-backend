import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: jest.Mocked<NotificationService>;

  const authUser = { userId: 'user-1', email: 'arun@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            listForUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('maps documents through the response DTO', async () => {
      service.listForUser.mockResolvedValue({
        items: [
          {
            _id: { toString: () => 'n1' },
            type: 'guests',
            message: 'Priya RSVP\'d as attending',
            link: '/guests',
            read: false,
            createdAt: new Date('2026-01-01'),
          } as never,
        ],
        unreadCount: 1,
      });

      const result = await controller.findAll(authUser as never);

      expect(result.unreadCount).toBe(1);
      expect(result.items[0]).toMatchObject({ id: 'n1', type: 'guests', read: false });
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(service.listForUser).toHaveBeenCalledWith('user-1');
    });
  });
});
