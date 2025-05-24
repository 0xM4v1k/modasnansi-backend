import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProductGroupDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsNumber(
    {},
    {
      each: true,
    },
  )
  variation_ids: number[];

  @IsNumber(
    {},
    {
      each: true,
    },
  )
  recommended_product_ids: number[];

  @IsNumber()
  category_id: number;

  @IsNumber()
  brand_id: number;

  @IsNumber()
  target_audience_id: number;
}
