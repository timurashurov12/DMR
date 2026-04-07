import { IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @MaxLength(10)
  code!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
