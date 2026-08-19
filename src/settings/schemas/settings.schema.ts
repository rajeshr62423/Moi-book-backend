import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

export type DateFormat = 'DD MMM YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type Language = 'en' | 'ta';

export const DATE_FORMATS: DateFormat[] = ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
export const TIME_FORMATS: TimeFormat[] = ['12h', '24h'];
export const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR', 'GBP'];
export const LANGUAGES: Language[] = ['en', 'ta'];

// One document per user — @Prop values are never set via `new Settings()`,
// Mongoose hydrates real documents from the DB (see user.schema.ts for the
// same convention).
@Schema({ timestamps: true })
export class Settings {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: DATE_FORMATS, default: 'DD MMM YYYY' })
  dateFormat!: DateFormat;

  @Prop({ type: String, enum: TIME_FORMATS, default: '12h' })
  timeFormat!: TimeFormat;

  @Prop({ type: String, enum: CURRENCIES, default: 'INR' })
  currency!: Currency;

  @Prop({ type: String, enum: LANGUAGES, default: 'en' })
  language!: Language;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
