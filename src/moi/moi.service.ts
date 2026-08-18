import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Moi, MoiDocument } from './schemas/moi.schema';
import { CreateMoiDto } from './dto/create-moi.dto';
import { UpdateMoiDto } from './dto/update-moi.dto';

@Injectable()
export class MoiService {
  constructor(
    @InjectModel(Moi.name)
    private readonly moiModel: Model<MoiDocument>,
  ) {}

  findAll(userId: string): Promise<MoiDocument[]> {
    return this.moiModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1, createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<MoiDocument> {
    const moi = await this.moiModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!moi) {
      throw new NotFoundException('Moi contribution not found');
    }
    return moi;
  }

  create(userId: string, dto: CreateMoiDto): Promise<MoiDocument> {
    return this.moiModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateMoiDto,
  ): Promise<MoiDocument> {
    const moi = await this.moiModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!moi) {
      throw new NotFoundException('Moi contribution not found');
    }
    return moi;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.moiModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Moi contribution not found');
    }
  }
}
