import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TrimWhiteSpace } from 'utils/decorators';
import { ACCOUNT_STATUS, USER_TYPE } from 'utils/enums';

export class UpdateAuthDto {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @TrimWhiteSpace()
  @Length(3, 30)
  @IsString()
  @IsOptional()
  name?: string;

  @TrimWhiteSpace()
  // @Matches(/@(gmail)\.com$/, {
  //   message: 'Email must end with @gmail.com',
  // })
  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  profile_pic?: string;

  @IsIn(Object.keys(ACCOUNT_STATUS))
  @IsOptional()
  account_status?: string;

  @IsIn(Object.keys(USER_TYPE))
  @IsOptional()
  user_role?: string;

  @IsBoolean()
  @IsOptional()
  email_verified?: boolean;
}
