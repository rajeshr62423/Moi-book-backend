import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ReportFilterDto } from './report-filter.dto';

export class ReportQueryDto extends ReportFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_page?: number = 20;
}
