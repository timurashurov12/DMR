import { IsArray, ArrayMinSize, ArrayMaxSize, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkTranslateDto {
  @ApiProperty({ type: [String], description: 'Идентификаторы записей (до 500 за запрос)' })
  @IsArray()
  @ArrayMinSize(1, { message: 'ids не должен быть пустым' })
  @ArrayMaxSize(500, { message: 'не более 500 записей за один запрос' })
  @IsString({ each: true })
  ids!: string[];

  @ApiPropertyOptional({ type: [String], description: 'Языки для перевода; если не указано — все отсутствующие' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLocales?: string[];
}
