import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseCofingModule } from './config/db/database.config.module';
import { MongooseModelsModule } from './models/mongoose-model.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseCofingModule,
    MongooseModelsModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
