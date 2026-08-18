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
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { GuestResponseDto } from './dto/guest-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GuestResponseDto[]> {
    const guests = await this.guestService.findAll(user.userId);
    return guests.map((guest) => GuestResponseDto.fromDocument(guest));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.findOne(user.userId, id);
    return GuestResponseDto.fromDocument(guest);
  }

  @Post()
  @ApiMessage('Guest added successfully')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateGuestDto,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.create(user.userId, dto);
    return GuestResponseDto.fromDocument(guest);
  }

  @Patch(':id')
  @ApiMessage('Guest updated successfully')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateGuestDto,
  ): Promise<GuestResponseDto> {
    const guest = await this.guestService.update(user.userId, id, dto);
    return GuestResponseDto.fromDocument(guest);
  }

  @Delete(':id')
  @ApiMessage('Guest deleted successfully')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<null> {
    await this.guestService.remove(user.userId, id);
    return null;
  }
}
