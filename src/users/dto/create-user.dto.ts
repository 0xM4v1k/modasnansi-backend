import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Permission } from '@permissions/entities/permission.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  full_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('PE')
  @IsNotEmpty()
  phone_number: string;

  @IsOptional()
  permissions: Permission[];

  @IsOptional()
  @IsBoolean()
  is_active: boolean;
}
