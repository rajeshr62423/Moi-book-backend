import { Test, TestingModule } from '@nestjs/testing';
import { MoiController } from './moi.controller';
import { MoiService } from './moi.service';

describe('MoiController', () => {
  let controller: MoiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoiController],
      providers: [
        {
          provide: MoiService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoiController>(MoiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
