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
import { MoiService } from './moi.service';
import { CreateMoiDto } from './dto/create-moi.dto';
import { UpdateMoiDto } from './dto/update-moi.dto';
import { MoiResponseDto } from './dto/moi-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('moi')
export class MoiController {
  constructor(private readonly moiService: MoiService) {}

  @Get()
  async findAll(@AccountId() accountId: string): Promise<MoiResponseDto[]> {
    const items = await this.moiService.findAll(accountId);
    return items.map((item) => MoiResponseDto.fromDocument(item));
  }

  @Get(':id')
  async findOne(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<MoiResponseDto> {
    const item = await this.moiService.findOne(accountId, id);
    return MoiResponseDto.fromDocument(item);
  }

  @Post()
  @ApiMessage('Moi contribution saved successfully')
  async create(
    @AccountId() accountId: string,
    @Body() dto: CreateMoiDto,
  ): Promise<MoiResponseDto> {
    const item = await this.moiService.create(accountId, dto);
    return MoiResponseDto.fromDocument(item);
  }

  @Patch(':id')
  @ApiMessage('Moi contribution updated successfully')
  async update(
    @AccountId() accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMoiDto,
  ): Promise<MoiResponseDto> {
    const item = await this.moiService.update(accountId, id, dto);
    return MoiResponseDto.fromDocument(item);
  }

  @Delete(':id')
  @ApiMessage('Moi contribution deleted successfully')
  async remove(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    await this.moiService.remove(accountId, id);
    return null;
  }
}
