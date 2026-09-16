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
import { AccountId } from '../team/account-id.decorator';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  async findAll(@AccountId() accountId: string): Promise<EventResponseDto[]> {
    const events = await this.eventService.findAll(accountId);
    return events.map((event) => EventResponseDto.fromDocument(event));
  }

  @Get(':id')
  async findOne(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.findOne(accountId, id);
    return EventResponseDto.fromDocument(event);
  }

  @Post()
  @ApiMessage('Event created successfully')
  async create(
    @AccountId() accountId: string,
    @Body() dto: CreateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.create(accountId, dto);
    return EventResponseDto.fromDocument(event);
  }

  @Patch(':id')
  @ApiMessage('Event updated successfully')
  async update(
    @AccountId() accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventService.update(accountId, id, dto);
    return EventResponseDto.fromDocument(event);
  }

  @Delete(':id')
  @ApiMessage('Event deleted successfully')
  async remove(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    await this.eventService.remove(accountId, id);
    return null;
  }
}
