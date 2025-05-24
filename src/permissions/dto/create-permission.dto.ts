import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  name: string;
}
