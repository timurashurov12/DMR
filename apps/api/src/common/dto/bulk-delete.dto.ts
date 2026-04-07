import { IsArray, ArrayMinSize, IsString } from 'class-validator';

export class BulkDeleteByIdsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'ids не должен быть пустым' })
  @IsString({ each: true })
  ids!: string[];
}
