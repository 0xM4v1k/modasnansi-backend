import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { BaseQueryParamsDto } from '@common/dto/base-query-params.dto';

export class FileQueryParamsDto extends BaseQueryParamsDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  filename: string;

  @IsOptional()
  @IsString()
  mimeType: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @IsInt()
  size: number;

  @IsOptional()
  @IsUrl()
  url: string;
}
