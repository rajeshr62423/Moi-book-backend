import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MoiService } from './moi.service';
import { Moi } from './schemas/moi.schema';

describe('MoiService', () => {
  let service: MoiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoiService,
        {
          provide: getModelToken(Moi.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MoiService>(MoiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
