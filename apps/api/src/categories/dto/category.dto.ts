import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TranslationDto {
  @IsString()
  locale!: string;
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateCategoryDto {
  @IsString()
  menuTypeId!: string;
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations?: TranslationDto[];
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  menuTypeId?: string;
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations?: TranslationDto[];
}
