import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, Min, IsUUID, ArrayMinSize } from 'class-validator';
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

export class CreateMenuItemDto {
  @IsString()
  categoryId!: string;
  @IsNumber()
  @Min(0)
  price!: number;
  @IsOptional()
  @IsString()
  weightOrVolume?: string;
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

export class UpdateMenuItemDto {
  @IsOptional()
  @IsString()
  categoryId?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
  @IsOptional()
  @IsString()
  weightOrVolume?: string;
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

export class BulkUpdateMenuItemDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'ids не должен быть пустым' })
  @IsUUID('4', { each: true })
  ids!: string[];
  @IsOptional()
  @IsString()
  @IsUUID('4')
  categoryId?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BulkDeleteMenuItemDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'ids не должен быть пустым' })
  @IsUUID('4', { each: true })
  ids!: string[];
}
