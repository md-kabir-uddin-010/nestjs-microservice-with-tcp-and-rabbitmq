import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class AccessTokenDto {
  @IsString()
  @IsJWT()
  @IsNotEmpty()
  access_token: string;
}
