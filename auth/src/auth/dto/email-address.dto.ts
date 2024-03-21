import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailAddressDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
