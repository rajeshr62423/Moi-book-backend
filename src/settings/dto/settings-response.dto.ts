import { SettingsDocument } from '../schemas/settings.schema';
import type { DateFormat, TimeFormat, Currency, Language } from '../schemas/settings.schema';

/** Public shape of a Settings document — omits userId/_id/timestamps, the frontend never needs them. */
export class SettingsResponseDto {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  currency: Currency;
  language: Language;

  static fromDocument(settings: SettingsDocument): SettingsResponseDto {
    return {
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      currency: settings.currency,
      language: settings.language,
    };
  }
}
