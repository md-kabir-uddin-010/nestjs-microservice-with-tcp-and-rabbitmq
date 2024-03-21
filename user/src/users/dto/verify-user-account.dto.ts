import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { TrimWhiteSpace } from 'utils/decorators';
import { ACCOUNT_STATUS } from 'utils/enums';

export class VerifyUserAccountDto {
  @TrimWhiteSpace()
  // @Matches(/@(gmail)\.com$/, {
  //   message: 'Email must end with @gmail.com',
  // })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email?: string;

  @IsIn(Object.keys(ACCOUNT_STATUS))
  @IsNotEmpty()
  account_status?: string;

  @IsBoolean()
  @IsNotEmpty()
  email_verified?: boolean;
}
