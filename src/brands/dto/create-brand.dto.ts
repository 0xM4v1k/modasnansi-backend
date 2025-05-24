import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  name: string;
}
