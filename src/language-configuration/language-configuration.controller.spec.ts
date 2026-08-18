import { Test, TestingModule } from '@nestjs/testing';
import { LanguageConfigurationController } from './language-configuration.controller';

describe('LanguageConfigurationController', () => {
  let controller: LanguageConfigurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageConfigurationController],
    }).compile();

    controller = module.get<LanguageConfigurationController>(
      LanguageConfigurationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
