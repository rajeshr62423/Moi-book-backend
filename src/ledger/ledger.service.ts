import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ledger, LedgerDocument } from './schemas/ledger.schema';
import { CreateLedgerDto } from './dto/create-ledger.dto';
import { UpdateLedgerDto } from './dto/update-ledger.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LedgerService {
  constructor(
    @InjectModel(Ledger.name)
    private readonly ledgerModel: Model<LedgerDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  findAll(userId: string): Promise<LedgerDocument[]> {
    return this.ledgerModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1, createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<LedgerDocument> {
    const ledger = await this.ledgerModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!ledger) {
      throw new NotFoundException('Ledger entry not found');
    }
    return ledger;
  }

  async create(userId: string, dto: CreateLedgerDto): Promise<LedgerDocument> {
    const ledger = await this.ledgerModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });

    if (ledger.status === 'paid') {
      await this.notificationService
        .create(userId, {
          type: 'ledger',
          message: `Payment logged: ${ledger.title} (₹${ledger.amount})`,
          link: '/ledger',
        })
        .catch(() => undefined);
    }

    return ledger;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateLedgerDto,
  ): Promise<LedgerDocument> {
    const previous = await this.ledgerModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!previous) {
      throw new NotFoundException('Ledger entry not found');
    }

    const ledger = await this.ledgerModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!ledger) {
      throw new NotFoundException('Ledger entry not found');
    }

    if (dto.status === 'paid' && previous.status === 'pending') {
      await this.notificationService
        .create(userId, {
          type: 'ledger',
          message: `Payment logged: ${ledger.title} (₹${ledger.amount})`,
          link: '/ledger',
        })
        .catch(() => undefined);
    }

    return ledger;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.ledgerModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Ledger entry not found');
    }
  }
}
