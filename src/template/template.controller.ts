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
import { TemplateService } from './template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateResponseDto } from './dto/template-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TemplateResponseDto[]> {
    const templates = await this.templateService.findAll(user.userId);
    return templates.map((template) =>
      TemplateResponseDto.fromDocument(template),
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateService.findOne(user.userId, id);
    return TemplateResponseDto.fromDocument(template);
  }

  @Post()
  @ApiMessage('Template created successfully')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateService.create(user.userId, dto);
    return TemplateResponseDto.fromDocument(template);
  }

  @Patch(':id')
  @ApiMessage('Template updated successfully')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.templateService.update(user.userId, id, dto);
    return TemplateResponseDto.fromDocument(template);
  }

  @Delete(':id')
  @ApiMessage('Template deleted successfully')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<null> {
    await this.templateService.remove(user.userId, id);
    return null;
  }
}
