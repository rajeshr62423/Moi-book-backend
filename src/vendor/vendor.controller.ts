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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorResponseDto } from './dto/vendor-response.dto';

@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  async findAll(@AccountId() accountId: string): Promise<VendorResponseDto[]> {
    const vendors = await this.vendorService.findAll(accountId);
    return vendors.map((vendor) => VendorResponseDto.fromDocument(vendor));
  }

  @Get(':id')
  async findOne(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.findOne(accountId, id);
    return VendorResponseDto.fromDocument(vendor);
  }

  @Post()
  @ApiMessage('Vendor added successfully')
  async create(
    @AccountId() accountId: string,
    @Body() dto: CreateVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.create(accountId, dto);
    return VendorResponseDto.fromDocument(vendor);
  }

  @Patch(':id')
  @ApiMessage('Vendor updated successfully')
  async update(
    @AccountId() accountId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVendorDto,
  ): Promise<VendorResponseDto> {
    const vendor = await this.vendorService.update(accountId, id, dto);
    return VendorResponseDto.fromDocument(vendor);
  }

  @Delete(':id')
  @ApiMessage('Vendor deleted successfully')
  async remove(
    @AccountId() accountId: string,
    @Param('id') id: string,
  ): Promise<null> {
    await this.vendorService.remove(accountId, id);
    return null;
  }
}
