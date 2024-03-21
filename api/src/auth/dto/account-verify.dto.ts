import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AccountVerifyDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  otp: number;
}
