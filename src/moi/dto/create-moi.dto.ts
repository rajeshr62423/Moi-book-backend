import {
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  MOI_GIFT_CATEGORIES,
  MOI_GIFT_UNITS,
  MOI_PAYMENT_METHODS,
  MOI_TYPES,
} from '../schemas/moi.schema';

export class CreateMoiDto {
  @IsMongoId({ message: 'A valid guest is required' })
  guestId!: string;

  @IsMongoId({ message: 'A valid event is required' })
  eventId!: string;

  @IsIn(MOI_TYPES, { message: 'Invalid contribution type' })
  type!: (typeof MOI_TYPES)[number];

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in yyyy-mm-dd format' })
  date!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Money fields — required only when type === 'money'.
  @ValidateIf((dto: CreateMoiDto) => dto.type === 'money')
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsIn(MOI_PAYMENT_METHODS, { message: 'Invalid payment method' })
  method?: (typeof MOI_PAYMENT_METHODS)[number];

  @IsOptional()
  @IsString()
  reference?: string;

  // Gift fields — all optional even when type === 'gift', matching the form.
  @IsOptional()
  @IsIn(MOI_GIFT_CATEGORIES, { message: 'Invalid gift category' })
  giftCategory?: (typeof MOI_GIFT_CATEGORIES)[number];

  @IsOptional()
  @IsString()
  giftName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsIn(MOI_GIFT_UNITS, { message: 'Invalid unit' })
  unit?: (typeof MOI_GIFT_UNITS)[number];

  @IsOptional()
  @IsNumber()
  @Min(0)
  giftValue?: number;
}
