import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import type { GuestDocument } from './schemas/guest.schema';

describe('GuestController', () => {
  let controller: GuestController;
  let service: jest.Mocked<GuestService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestController],
      providers: [
        {
          provide: GuestService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            eventDatesFor: jest.fn().mockResolvedValue(new Map()),
          },
        },
      ],
    }).compile();

    controller = module.get<GuestController>(GuestController);
    service = module.get(GuestService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll joins each guest with its event date for rsvpOverdue', async () => {
    const eventId = new Types.ObjectId();
    const guest = {
      _id: new Types.ObjectId(),
      name: 'Aunt Priya',
      group: 'family',
      phone: '999',
      eventId,
      status: 'pending',
    } as unknown as GuestDocument;

    service.findAll.mockResolvedValue([guest]);
    service.eventDatesFor.mockResolvedValue(
      new Map([[eventId.toString(), '2000-01-01']]),
    );

    const result = await controller.findAll('account-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
    expect(service.findAll).toHaveBeenCalledWith('account-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
    expect(service.eventDatesFor).toHaveBeenCalledWith([guest]);
    expect(result[0].rsvpOverdue).toBe(true);
  });
});
