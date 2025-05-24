import { IsOptional, IsString } from 'class-validator';
import { BaseQueryParamsDto } from '@common/dto/base-query-params.dto';

export class SizeQueryParamsDto extends BaseQueryParamsDto {
  @IsOptional()
  @IsString()
  name?: string;
}
