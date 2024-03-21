import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { TrimWhiteSpace } from 'utils/decorators';

export class ForgetPasswordDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @TrimWhiteSpace()
  // @IsStrongPassword()
  @Length(6, 30)
  @IsString()
  @IsNotEmpty()
  password: string;
}
