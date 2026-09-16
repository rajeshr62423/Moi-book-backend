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
import { LedgerService } from './ledger.service';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { LedgerResponseDto } from './dto/ledger-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  async findAll(@AccountId() accountId: string): Promise<LedgerResponseDto[]> {
    const entries = await this.ledgerService.findAll(accountId);
    return entries.map((entry) => LedgerResponseDto.fromDocument(entry));
  }

  @Get(':id')
  async findOne(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<LedgerResponseDto> {
    const entry = await this.ledgerService.findOne(accountId, id);
    return LedgerResponseDto.fromDocument(entry);
  }

  @Post()
  @ApiMessage('Transaction added successfully')
  async create(
    @AccountId() accountId: string,
    @Body() dto: CreateLedgerDto,
  ): Promise<LedgerResponseDto> {
    const entry = await this.ledgerService.create(accountId, dto);
    return LedgerResponseDto.fromDocument(entry);
  }

  @Patch(':id')
  @ApiMessage('Transaction updated successfully')
  async update(
    @AccountId() accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLedgerDto,
  ): Promise<LedgerResponseDto> {
    const entry = await this.ledgerService.update(accountId, id, dto);
    return LedgerResponseDto.fromDocument(entry);
  }

  @Delete(':id')
  @ApiMessage('Transaction deleted successfully')
  async remove(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    await this.ledgerService.remove(accountId, id);
    return null;
  }
}
