import { IsIn, IsOptional } from 'class-validator';
import {
  DATE_FORMATS,
  TIME_FORMATS,
  CURRENCIES,
  LANGUAGES,
  type DateFormat,
  type TimeFormat,
  type Currency,
  type Language,
} from '../schemas/settings.schema';

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(DATE_FORMATS, { message: 'Invalid date format' })
  dateFormat?: DateFormat;

  @IsOptional()
  @IsIn(TIME_FORMATS, { message: 'Invalid time format' })
  timeFormat?: TimeFormat;

  @IsOptional()
  @IsIn(CURRENCIES, { message: 'Invalid currency' })
  currency?: Currency;

  @IsOptional()
  @IsIn(LANGUAGES, { message: 'Invalid language' })
  language?: Language;
}
