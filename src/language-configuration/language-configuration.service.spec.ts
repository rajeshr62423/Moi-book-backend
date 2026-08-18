import { Test, TestingModule } from '@nestjs/testing';
import { LanguageConfigurationService } from './language-configuration.service';

describe('LanguageConfigurationService', () => {
  let service: LanguageConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageConfigurationService],
    }).compile();

    service = module.get<LanguageConfigurationService>(
      LanguageConfigurationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
