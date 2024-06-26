import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsJWT()
  @IsNotEmpty()
  refresh_token: string;
}
