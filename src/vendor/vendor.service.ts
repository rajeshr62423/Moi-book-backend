import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name)
    private readonly vendorModel: Model<VendorDocument>,
    private readonly notificationService: NotificationService,
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
    const previous = await this.vendorModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!previous) {
      throw new NotFoundException('Vendor not found');
    }

    const vendor = await this.vendorModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (dto.status === 'booked' && previous.status !== 'booked') {
      await this.notificationService
        .create(userId, {
          type: 'vendors',
          message: `${vendor.name} confirmed as booked`,
          link: '/vendors',
        })
        .catch(() => undefined);
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
