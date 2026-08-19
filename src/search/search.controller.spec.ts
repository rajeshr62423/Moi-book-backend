import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: jest.Mocked<SearchService>;

  const authUser = { userId: 'user-1', email: 'arun@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: { search: jest.fn() } }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('passes the query to the service and wraps the result in items', async () => {
      service.search.mockResolvedValue([
        { type: 'event', id: 'e1', title: 'Wedding', link: '/events' },
      ]);

      const result = await controller.search(authUser as never, 'wedding');

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(service.search).toHaveBeenCalledWith('user-1', 'wedding');
      expect(result).toEqual({ items: [{ type: 'event', id: 'e1', title: 'Wedding', link: '/events' }] });
    });

    it('defaults to an empty string when no q param is given', async () => {
      service.search.mockResolvedValue([]);

      await controller.search(authUser as never, undefined);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not a real unbound call
      expect(service.search).toHaveBeenCalledWith('user-1', '');
    });
  });
});
