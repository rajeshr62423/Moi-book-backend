import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Guest, GuestDocument } from './schemas/guest.schema';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class GuestService {
  constructor(
    @InjectModel(Guest.name)
    private readonly guestModel: Model<GuestDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  findAll(userId: string): Promise<GuestDocument[]> {
    return this.guestModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<GuestDocument> {
    const guest = await this.guestModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }
    return guest;
  }

  create(userId: string, dto: CreateGuestDto): Promise<GuestDocument> {
    return this.guestModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateGuestDto,
  ): Promise<GuestDocument> {
    const previous = await this.guestModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!previous) {
      throw new NotFoundException('Guest not found');
    }

    const guest = await this.guestModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!guest) {
      throw new NotFoundException('Guest not found');
    }

    if (dto.status && dto.status !== previous.status) {
      await this.notificationService
        .create(userId, {
          type: 'guests',
          message: `${guest.name} RSVP'd as ${dto.status}`,
          link: '/guests',
        })
        .catch(() => undefined);
    }

    return guest;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.guestModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Guest not found');
    }
  }
}
