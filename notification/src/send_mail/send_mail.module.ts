import { Module } from '@nestjs/common';
import { MailerModule } from 'src/mailer/mailer.module';
import { SendMailController } from './send_mail.controller';
import { SendMailService } from './send_mail.service';

@Module({
  imports: [MailerModule],
  controllers: [SendMailController],
  providers: [SendMailService],
})
export class SendMailModule {}
