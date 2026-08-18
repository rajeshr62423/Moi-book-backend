import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MinLength(1, { message: 'Template name is required' })
  name!: string;

  @IsString()
  @MinLength(1, { message: 'Subject is required' })
  subject!: string;

  @IsString()
  @MinLength(1, { message: 'Template body is required' })
  body!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
