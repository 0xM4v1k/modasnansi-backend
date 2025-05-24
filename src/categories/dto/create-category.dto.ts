import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  name: string;
}
