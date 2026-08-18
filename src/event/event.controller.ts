import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventResponseDto[]> {
    const events = await this.eventService.findAll(user.userId);
    return events.map((event) => EventResponseDto.fromDocument(event));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.findOne(user.userId, id);
    return EventResponseDto.fromDocument(event);
  }

  @Post()
  @ApiMessage('Event created successfully')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.create(user.userId, dto);
    return EventResponseDto.fromDocument(event);
  }

  @Patch(':id')
  @ApiMessage('Event updated successfully')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.update(user.userId, id, dto);
    return EventResponseDto.fromDocument(event);
  }

  @Delete(':id')
  @ApiMessage('Event deleted successfully')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<null> {
    await this.eventService.remove(user.userId, id);
    return null;
  }
}
