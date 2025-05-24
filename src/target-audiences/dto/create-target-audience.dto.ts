import { IsNotEmpty, IsString, IsUppercase } from 'class-validator';

export class CreateTargetAudienceDto {
  @IsString()
  @IsNotEmpty()
  @IsUppercase()
  name: string;
}
