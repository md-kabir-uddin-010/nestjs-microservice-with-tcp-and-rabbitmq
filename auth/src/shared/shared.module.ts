import { Global, Module } from '@nestjs/common';
import { ExceptionService } from './exception.service';
import { SharedService } from './shared.service';

@Global()
@Module({
  providers: [SharedService, ExceptionService],
  exports: [SharedService, ExceptionService],
})
export class SharedModule {}
