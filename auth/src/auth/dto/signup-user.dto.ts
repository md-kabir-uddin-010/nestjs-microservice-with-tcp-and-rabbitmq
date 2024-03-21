import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { TrimWhiteSpace } from 'utils/decorators';

export class SignupUserDto {
  @TrimWhiteSpace()
  @Length(3, 30)
  @IsString()
  @IsNotEmpty()
  name: string;

  @TrimWhiteSpace()
  // @Matches(/@(gmail)\.com$/, {
  //   message: 'Email must end with @gmail.com',
  // })
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
