import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { NotificationService } from './notification.service';
import { NotificationListResponseDto, NotificationResponseDto } from './dto/notification-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser): Promise<NotificationListResponseDto> {
    const { items, unreadCount } = await this.notificationService.listForUser(user.userId);
    return { items: items.map(NotificationResponseDto.fromDocument), unreadCount };
  }

  @Patch(':id/read')
  @ApiMessage('Notification marked as read')
  async markRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.markAsRead(user.userId, id);
    return NotificationResponseDto.fromDocument(notification);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('All notifications marked as read')
  async markAllRead(@CurrentUser() user: AuthenticatedUser): Promise<null> {
    await this.notificationService.markAllAsRead(user.userId);
    return null;
  }

  @Delete(':id')
  @ApiMessage('Notification deleted')
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string): Promise<null> {
    await this.notificationService.remove(user.userId, id);
    return null;
  }
}
