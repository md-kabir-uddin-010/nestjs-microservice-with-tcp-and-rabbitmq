import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
// import { DatabaseCofingModule } from './config/db/database.config.module';
// import { MongooseModelsModule } from './models/mongoose-model.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      // store: redisStore as unknown as CacheStore,

      // // Store-specific configuration:
      // host: 'localhost',
      // port: 6379,
    }),

    // DatabaseCofingModule,
    // MongooseModelsModule,
    AuthModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
