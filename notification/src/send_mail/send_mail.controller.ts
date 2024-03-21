import { Body, Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AccountVerifyMailDto } from './dto/accout-verify-mail.dto';
import { ResetPasswordMailDto } from './dto/reset-password-mail.dto';
import { SendMailService } from './send_mail.service';

@Controller('send')
export class SendMailController {
  constructor(private readonly sendMailService: SendMailService) {}

  // @Post('account/verification/mail')
  @EventPattern('sent_account_verification_mail')
  async sendVerificationMail(
    @Body() accountVerifyMailDto: AccountVerifyMailDto,
  ) {
    return await this.sendMailService.accountVerifyMail(accountVerifyMailDto);
  }

  // @Post('reset/password/mail')
  @EventPattern('sent_reset_password_mail')
  async sendResetPasswordMail(
    @Body() resetPasswordMailDto: ResetPasswordMailDto,
  ) {
    return await this.sendMailService.resetPasswordMail(resetPasswordMailDto);
  }
}
