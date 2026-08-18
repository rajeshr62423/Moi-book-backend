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
import { MoiService } from './moi.service';
import { CreateMoiDto } from './dto/create-moi.dto';
import { UpdateMoiDto } from './dto/update-moi.dto';
import { MoiResponseDto } from './dto/moi-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('moi')
export class MoiController {
  constructor(private readonly moiService: MoiService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MoiResponseDto[]> {
    const items = await this.moiService.findAll(user.userId);
    return items.map((item) => MoiResponseDto.fromDocument(item));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MoiResponseDto> {
    const item = await this.moiService.findOne(user.userId, id);
    return MoiResponseDto.fromDocument(item);
  }

  @Post()
  @ApiMessage('Moi contribution saved successfully')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMoiDto,
  ): Promise<MoiResponseDto> {
    const item = await this.moiService.create(user.userId, dto);
    return MoiResponseDto.fromDocument(item);
  }

  @Patch(':id')
  @ApiMessage('Moi contribution updated successfully')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateMoiDto,
  ): Promise<MoiResponseDto> {
    const item = await this.moiService.update(user.userId, id, dto);
    return MoiResponseDto.fromDocument(item);
  }

  @Delete(':id')
  @ApiMessage('Moi contribution deleted successfully')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<null> {
    await this.moiService.remove(user.userId, id);
    return null;
  }
}
