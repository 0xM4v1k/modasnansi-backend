// src/brands/dto/get-brands-query-params.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { BaseQueryParamsDto } from '@common/dto/base-query-params.dto';

export class BrandQueryParamsDto extends BaseQueryParamsDto {
  @IsOptional()
  @IsString()
  name?: string;
}
