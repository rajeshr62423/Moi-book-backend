import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountId } from '../team/account-id.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { NotificationService } from './notification.service';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(
    @AccountId() accountId: string,
  ): Promise<NotificationListResponseDto> {
    const { items, unreadCount } =
      await this.notificationService.listForUser(accountId);
    return {
      items: items.map((item) => NotificationResponseDto.fromDocument(item)),
      unreadCount,
    };
  }

  @Patch(':id/read')
  @ApiMessage('Notification marked as read')
  async markRead(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.markAsRead(
      accountId,
      id,
    );
    return NotificationResponseDto.fromDocument(notification);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('All notifications marked as read')
  async markAllRead(@AccountId() accountId: string): Promise<null> {
    await this.notificationService.markAllAsRead(accountId);
    return null;
  }

  @Delete(':id')
  @ApiMessage('Notification deleted')
  async remove(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    await this.notificationService.remove(accountId, id);
    return null;
  }
}
