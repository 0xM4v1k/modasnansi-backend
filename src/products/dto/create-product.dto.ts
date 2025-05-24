import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(0)
  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number) // Convierte strings a números
  @Transform(({ value }) => {
    const numValue: number = parseFloat(String(value));
    return parseFloat(numValue.toFixed(2)); // Asegura que solo tenga 2 decimales
  })
  price: number;

  @IsNumber()
  @IsNotEmpty()
  brand_id: number;

  @IsNumber()
  @IsNotEmpty()
  target_audience_id: number;

  @IsNumber()
  @IsNotEmpty()
  category_id: number;

  @IsNumber()
  @IsNotEmpty()
  size_id: number;

  @IsNumber()
  @IsNotEmpty()
  education_level_id: number;
}
