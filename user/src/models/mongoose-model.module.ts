import { Global, Module } from '@nestjs/common';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { USER_MODEL, UserSchema } from './user';

const Models: ModelDefinition[] = [{ name: USER_MODEL, schema: UserSchema }];

@Global()
@Module({
  imports: [MongooseModule.forFeature(Models)],
  exports: [MongooseModule],
})
export class MongooseModelsModule {}
