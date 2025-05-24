import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BaseQueryParamsDto } from '@common/dto/base-query-params.dto';

export class ProductQueryParamsDto extends BaseQueryParamsDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['MASCULINO', 'FEMENINO', 'UNISEX'])
  genre?: 'MASCULINO' | 'FEMENINO' | 'UNISEX';

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @IsNumber()
  price?: number;

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

  @IsOptional()
  @IsString()
  size_name?: string;
}
