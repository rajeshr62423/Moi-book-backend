import { Module } from '@nestjs/common';
import { LanguageConfigurationController } from './language-configuration.controller';
import { LanguageConfigurationService } from './language-configuration.service';

@Module({
  controllers: [LanguageConfigurationController],
  providers: [LanguageConfigurationService],
})
export class LanguageConfigurationModule {}
