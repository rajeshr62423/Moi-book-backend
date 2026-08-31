import { IsIn, IsMongoId, IsOptional, Matches } from 'class-validator';

export const REPORT_TYPES = [
  'eventSummary',
  'guestReport',
  'attendanceReport',
  'eventActivity',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export class ReportFilterDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date_from must be in yyyy-mm-dd format',
  })
  date_from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date_to must be in yyyy-mm-dd format',
  })
  date_to?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid event id' })
  event_id?: string;

  @IsIn(REPORT_TYPES, { message: 'Invalid report type' })
  report_type!: ReportType;
}
