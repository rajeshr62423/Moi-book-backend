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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VendorResponseDto[]> {
    const vendors = await this.vendorService.findAll(user.userId);
    return vendors.map((vendor) => VendorResponseDto.fromDocument(vendor));
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.findOne(user.userId, id);
    return VendorResponseDto.fromDocument(vendor);
  }

  @Post()
  @ApiMessage('Vendor added successfully')
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.create(user.userId, dto);
    return VendorResponseDto.fromDocument(vendor);
  }

  @Patch(':id')
  @ApiMessage('Vendor updated successfully')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.update(user.userId, id, dto);
    return VendorResponseDto.fromDocument(vendor);
  }

  @Delete(':id')
  @ApiMessage('Vendor deleted successfully')
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<null> {
    await this.vendorService.remove(user.userId, id);
    return null;
  }
}
