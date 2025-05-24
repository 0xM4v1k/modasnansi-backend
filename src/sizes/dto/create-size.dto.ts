import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreateSizeDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  name: string;
}
