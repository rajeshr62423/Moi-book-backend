import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Notification } from './schemas/notification.schema';

describe('NotificationService', () => {
  let service: NotificationService;
  let model: {
    create: jest.Mock;
    find: jest.Mock;
    countDocuments: jest.Mock;
    findOneAndUpdate: jest.Mock;
    updateMany: jest.Mock;
    deleteOne: jest.Mock;
  };

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      deleteOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getModelToken(Notification.name), useValue: model },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listForUser', () => {
    it('returns items and unread count together', async () => {
      const exec1 = jest.fn().mockResolvedValue([{ _id: 'n1' }]);
      model.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: exec1 }) }),
      });
      model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(3) });

      const result = await service.listForUser('507f1f77bcf86cd799439011');

      expect(result).toEqual({ items: [{ _id: 'n1' }], unreadCount: 3 });
    });
  });

  describe('markAsRead', () => {
    it('throws when the notification does not exist (or is not theirs)', async () => {
      model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.markAsRead('507f1f77bcf86cd799439011', 'n1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the updated document when found', async () => {
      model.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'n1', read: true }),
      });

      const result = await service.markAsRead('507f1f77bcf86cd799439011', 'n1');

      expect(result).toEqual({ _id: 'n1', read: true });
    });
  });

  describe('remove', () => {
    it('throws when nothing was deleted', async () => {
      model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });

      await expect(service.remove('507f1f77bcf86cd799439011', 'n1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
