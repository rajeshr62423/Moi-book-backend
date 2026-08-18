import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
  ) {}

  findAll(userId: string): Promise<TemplateDocument[]> {
    return this.templateModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<TemplateDocument> {
    const template = await this.templateModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  create(userId: string, dto: CreateTemplateDto): Promise<TemplateDocument> {
    return this.templateModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<TemplateDocument> {
    const template = await this.templateModel
      .findOneAndUpdate({ _id: id, userId: new Types.ObjectId(userId) }, dto, {
        new: true,
      })
      .exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.templateModel
      .deleteOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Template not found');
    }
  }
}
