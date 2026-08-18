import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  findAll(userId: string): Promise<EventDocument[]> {
    return this.eventModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: 1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<EventDocument> {
    const event = await this.eventModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  create(userId: string, dto: CreateEventDto): Promise<EventDocument> {
    return this.eventModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateEventDto,
  ): Promise<EventDocument> {
    const event = await this.eventModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.eventModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Event not found');
    }
  }
}
