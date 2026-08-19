import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() authUser: AuthenticatedUser): Promise<SettingsResponseDto> {
    const settings = await this.settingsService.getOrCreate(authUser.userId);
    return SettingsResponseDto.fromDocument(settings);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiMessage('Preferences updated successfully')
  async updateMe(
    @CurrentUser() authUser: AuthenticatedUser,
    @Body() dto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    const settings = await this.settingsService.update(authUser.userId, dto);
    return SettingsResponseDto.fromDocument(settings);
  }
}
