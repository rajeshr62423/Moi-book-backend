import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
  ) {}

  findAll(userId: string): Promise<VendorDocument[]> {
    return this.vendorModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<VendorDocument> {
    const vendor = await this.vendorModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  create(userId: string, dto: CreateVendorDto): Promise<VendorDocument> {
    return this.vendorModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateVendorDto,
  ): Promise<VendorDocument> {
    const vendor = await this.vendorModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.vendorModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Vendor not found');
    }
  }
}
