import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { MailerService } from 'src/mailer/mailer.service';
import { RESPONSE_MESSAGE } from 'utils/enums';
import { AccountVerifyMailDto } from './dto/accout-verify-mail.dto';
import { ResetPasswordMailDto } from './dto/reset-password-mail.dto';

@Injectable()
export class SendMailService {
  constructor(private readonly mailerService: MailerService) {}

  // send account verification email
  async accountVerifyMail(accountVerifyMailDto: AccountVerifyMailDto) {
    const { email, otp_code } = accountVerifyMailDto;

    const sentEmail = await this.mailerService.sendVerificationEmail(
      email,
      otp_code,
    );
    if (!sentEmail) {
      return new RpcException(RESPONSE_MESSAGE.SERVER_TEMPORARY_DOWN);
    }

    return {
      statusCode: 200,
      message: 'email sent succesfull',
    };
  }

  // send reset password email
  async resetPasswordMail(resetPasswordMailDto: ResetPasswordMailDto) {
    const { email, otp_code } = resetPasswordMailDto;

    const sentEmail = await this.mailerService.sendResetPasswordEmail(
      email,
      otp_code,
    );
    if (!sentEmail) {
      return new RpcException(RESPONSE_MESSAGE.SERVER_TEMPORARY_DOWN);
    }

    return {
      statusCode: 200,
      message: 'email sent succesfull',
    };
  }
}
