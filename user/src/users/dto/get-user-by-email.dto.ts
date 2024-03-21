import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { TrimWhiteSpace } from 'utils/decorators';

export class GetUserByEmailDto {
  @TrimWhiteSpace()
  // @Matches(/@(gmail)\.com$/, {
  //   message: 'Email must end with @gmail.com',
  // })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
