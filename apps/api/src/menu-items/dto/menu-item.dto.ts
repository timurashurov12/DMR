import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsInt,
  IsIn,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === undefined || value === null ? undefined : value;

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
  @IsString()
  imagePath?: string | null;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations?: TranslationDto[];
}

export class BulkUpdateMenuItemDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'ids не должен быть пустым' })
  @IsString({ each: true })
  ids!: string[];
  @IsOptional()
  @IsString()
  categoryId?: string;
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BulkDeleteMenuItemDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'ids не должен быть пустым' })
  @IsString({ each: true })
  ids!: string[];
}

export class QueryMenuItemsDto {
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  menuTypeId?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(['active', 'inactive'])
  active?: 'active' | 'inactive';

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['name', 'category', 'menuType', 'price', 'weightOrVolume', 'isActive'])
  sortBy: string = 'name';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir: 'asc' | 'desc' = 'asc';

  @Transform(({ value }) => {
    if (value === undefined || value === '' || value === null) return 1;
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Transform(({ value }) => {
    if (value === undefined || value === '' || value === null) return 10;
    const n = Number(value);
    return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 10;
  })
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;
}
