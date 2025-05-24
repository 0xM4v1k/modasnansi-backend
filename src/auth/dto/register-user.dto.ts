import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterUserDto {
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
}
