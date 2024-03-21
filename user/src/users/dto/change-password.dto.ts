import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { TrimWhiteSpace } from 'utils/decorators';

export class ChangePasswordDto {
  @TrimWhiteSpace()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @TrimWhiteSpace()
  // @IsStrongPassword()
  @Length(6, 30)
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @TrimWhiteSpace()
  // @IsStrongPassword()
  @Length(6, 30)
  @IsString()
  @IsNotEmpty()
  new_password: string;
}
