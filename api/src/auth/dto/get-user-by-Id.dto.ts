import { IsMongoId, IsString } from 'class-validator';

export class GetUserByIdDto {
  @IsString()
  @IsMongoId()
  id: string;
}
