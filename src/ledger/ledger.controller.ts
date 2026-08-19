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
import { LedgerService } from './ledger.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgerResponseDto } from './dto/ledger-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LedgerResponseDto[]> {
    const entries = await this.ledgerService.findAll(user.userId);
    return entries.map((entry) => LedgerResponseDto.fromDocument(entry));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<LedgerResponseDto> {
    const entry = await this.ledgerService.findOne(user.userId, id);
    return LedgerResponseDto.fromDocument(entry);
  }

  @Post()
  @ApiMessage('Transaction added successfully')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLedgerDto,
  ): Promise<LedgerResponseDto> {
    const entry = await this.ledgerService.create(user.userId, dto);
    return LedgerResponseDto.fromDocument(entry);
  }

  @Patch(':id')
  @ApiMessage('Transaction updated successfully')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLedgerDto,
  ): Promise<LedgerResponseDto> {
    const entry = await this.ledgerService.update(user.userId, id, dto);
    return LedgerResponseDto.fromDocument(entry);
  }

  @Delete(':id')
  @ApiMessage('Transaction deleted successfully')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<null> {
    await this.ledgerService.remove(user.userId, id);
    return null;
  }
}
