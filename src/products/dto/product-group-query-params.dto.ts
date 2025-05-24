import { IsOptional, IsString } from 'class-validator';
import { BaseQueryParamsDto } from '@common/dto/base-query-params.dto';

export class ProductGroupQueryParamsDto extends BaseQueryParamsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  brand_name?: string;

  @IsOptional()
  @IsString()
  target_audience_name?: string;

  @IsOptional()
  @IsString()
  education_level_name?: string;

  @IsOptional()
  @IsString()
  category_name?: string;
}
