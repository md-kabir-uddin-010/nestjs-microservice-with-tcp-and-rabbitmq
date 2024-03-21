import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @Length(3, 30)
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @Length(3, 30)
  @IsString()
  @IsNotEmpty()
  new_password: string;
}
