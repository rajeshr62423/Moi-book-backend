import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountId } from '../team/account-id.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@AccountId() accountId: string): Promise<SettingsResponseDto> {
    const settings = await this.settingsService.getOrCreate(accountId);
    return SettingsResponseDto.fromDocument(settings);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiMessage('Preferences updated successfully')
  async updateMe(
    @AccountId() accountId: string,
    @Body() dto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    const settings = await this.settingsService.update(accountId, dto);
    return SettingsResponseDto.fromDocument(settings);
  }
}
