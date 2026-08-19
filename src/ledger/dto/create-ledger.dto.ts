import {
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { LEDGER_CATEGORIES, LEDGER_STATUSES, LEDGER_TYPES } from '../schemas/ledger.schema';

export class CreateLedgerDto {
  @IsMongoId({ message: 'A valid event is required' })
  eventId!: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid vendor' })
  vendorId?: string;

  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title!: string;

  @IsIn(LEDGER_CATEGORIES, { message: 'Invalid category' })
  category!: (typeof LEDGER_CATEGORIES)[number];

  @IsOptional()
  @IsIn(LEDGER_TYPES, { message: 'Invalid type' })
  type?: (typeof LEDGER_TYPES)[number];

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsIn(LEDGER_STATUSES, { message: 'Invalid status' })
  status?: (typeof LEDGER_STATUSES)[number];

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in yyyy-mm-dd format' })
  date!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
