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
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get()
  async findAll(@AccountId() accountId: string): Promise<GuestResponseDto[]> {
    const guests = await this.guestService.findAll(accountId);
    const eventDates = await this.guestService.eventDatesFor(guests);
    return guests.map((guest) =>
      GuestResponseDto.fromDocument(
        guest,
        eventDates.get(guest.eventId.toString()),
      ),
    );
  }

  @Get(':id')
  async findOne(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.findOne(accountId, id);
    const eventDates = await this.guestService.eventDatesFor([guest]);
    return GuestResponseDto.fromDocument(
      guest,
      eventDates.get(guest.eventId.toString()),
    );
  }

  @Post()
  @ApiMessage('Guest added successfully')
  async create(
    @AccountId() accountId: string,
    @Body() dto: CreateGuestDto,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.create(accountId, dto);
    const eventDates = await this.guestService.eventDatesFor([guest]);
    return GuestResponseDto.fromDocument(
      guest,
      eventDates.get(guest.eventId.toString()),
    );
  }

  @Patch(':id')
  @ApiMessage('Guest updated successfully')
  async update(
    @AccountId() accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateGuestDto,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.update(accountId, id, dto);
    const eventDates = await this.guestService.eventDatesFor([guest]);
    return GuestResponseDto.fromDocument(
      guest,
      eventDates.get(guest.eventId.toString()),
    );
  }

  @Delete(':id')
  @ApiMessage('Guest deleted successfully')
  async remove(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    await this.guestService.remove(accountId, id);
    return null;
  }
}
