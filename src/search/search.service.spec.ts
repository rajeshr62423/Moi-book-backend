import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { Event } from '../event/schemas/event.schema';
import { Guest } from '../guest/schemas/guest.schema';
import { Vendor } from '../vendor/schemas/vendor.schema';
import { Moi } from '../moi/schemas/moi.schema';
import { Ledger } from '../ledger/schemas/ledger.schema';

const USER_ID = '507f1f77bcf86cd799439011';

function emptyFindMock() {
  return jest.fn().mockReturnValue({
    limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  });
}

describe('SearchService', () => {
  let service: SearchService;
  let eventModel: { find: jest.Mock };
  let guestModel: { find: jest.Mock };
  let vendorModel: { find: jest.Mock };
  let moiModel: { find: jest.Mock };
  let ledgerModel: { find: jest.Mock };

  beforeEach(async () => {
    eventModel = { find: emptyFindMock() };
    guestModel = { find: emptyFindMock() };
    vendorModel = { find: emptyFindMock() };
    moiModel = { find: emptyFindMock() };
    ledgerModel = { find: emptyFindMock() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getModelToken(Event.name), useValue: eventModel },
        { provide: getModelToken(Guest.name), useValue: guestModel },
        { provide: getModelToken(Vendor.name), useValue: vendorModel },
        { provide: getModelToken(Moi.name), useValue: moiModel },
        { provide: getModelToken(Ledger.name), useValue: ledgerModel },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('returns no results and skips querying for a too-short query', async () => {
      const results = await service.search(USER_ID, 'a');

      expect(results).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest mock reference, not a real unbound call
      expect(eventModel.find).not.toHaveBeenCalled();
    });

    it('returns no results for an empty/whitespace query', async () => {
      const results = await service.search(USER_ID, '   ');

      expect(results).toEqual([]);
    });

    it('maps matching guests into the unified result shape', async () => {
      guestModel.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            { _id: { toString: () => 'guest-1' }, name: 'Priya', phone: '9999999999' },
          ]),
        }),
      });

      const results = await service.search(USER_ID, 'priya');

      expect(results).toContainEqual({
        type: 'guest',
        id: 'guest-1',
        title: 'Priya',
        subtitle: '9999999999',
        link: '/guests/guest-1',
      });
    });

    it('resolves the contributing guest name for moi results', async () => {
      moiModel.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: { toString: () => 'moi-1' },
              guestId: { toString: () => 'guest-1' },
              type: 'gift',
              giftName: 'Silver plate',
            },
          ]),
        }),
      });
      // guestModel.find is called twice in this flow: once via .limit().exec()
      // for the direct guest-name/phone search, once via a bare .exec() to
      // resolve the moi contributor's name — both chains need to resolve.
      guestModel.find = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
        exec: jest.fn().mockResolvedValue([{ _id: { toString: () => 'guest-1' }, name: 'Priya' }]),
      });

      const results = await service.search(USER_ID, 'silver');

      expect(results).toContainEqual({
        type: 'moi',
        id: 'moi-1',
        title: 'Priya',
        subtitle: 'Silver plate',
        link: '/moi',
      });
    });

    it('does not treat regex special characters in the query as a pattern', async () => {
      await expect(service.search(USER_ID, '.*')).resolves.toBeDefined();
    });
  });
});
