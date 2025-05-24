import { IsOptional } from 'class-validator';
import { SortTypesEnum } from '../types/SortTypesEnum';
import { PaginationQueryDto } from './pagination-query.dto';

export class BaseQueryParamsDto extends PaginationQueryDto {
  @IsOptional()
  sortOrder?: SortTypesEnum;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  date_created?: string;

  @IsOptional()
  date_updated?: string;
}
