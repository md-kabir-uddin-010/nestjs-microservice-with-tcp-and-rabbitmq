import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Length(3, 30)
  @IsString()
  @IsNotEmpty()
  password: string;
}
