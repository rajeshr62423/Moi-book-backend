import { PartialType } from '@nestjs/mapped-types';
import { CreateMoiDto } from './create-moi.dto';

export class UpdateMoiDto extends PartialType(CreateMoiDto) {}
