import { Global, Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
// import { OTPSchema, OTP_MODEL } from './otp';
// import { REFRESH_TOKEN_MODEL, RefreshTokenSchema } from './token';

const Models: ModelDefinition[] = [
  // { name: OTP_MODEL, schema: OTPSchema },
  // { name: REFRESH_TOKEN_MODEL, schema: RefreshTokenSchema },
];

@Global()
@Module({
  imports: [MongooseModule.forFeature(Models)],
  exports: [MongooseModule],
})
export class MongooseModelsModule {}
