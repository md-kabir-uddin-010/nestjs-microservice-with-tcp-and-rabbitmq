import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class ResetPasswordMailDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsInt()
  @IsPositive()
  otp_code: number;
}
