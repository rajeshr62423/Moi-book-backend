import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  /** Auto-creates defaults on first access so GET /settings/me never 404s. */
  getOrCreate(userId: string): Promise<SettingsDocument> {
    return this.settingsModel
      .findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId } },
        { new: true, upsert: true },
      )
      .exec();
  }

  update(userId: string, dto: UpdateSettingsDto): Promise<SettingsDocument> {
    return this.settingsModel
      .findOneAndUpdate(
        { userId },
        { $set: dto, $setOnInsert: { userId } },
        { new: true, upsert: true },
      )
      .exec();
  }
}
