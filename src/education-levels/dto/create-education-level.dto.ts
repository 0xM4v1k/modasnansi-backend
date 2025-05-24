import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreateEducationLevelDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  name: string;
}
