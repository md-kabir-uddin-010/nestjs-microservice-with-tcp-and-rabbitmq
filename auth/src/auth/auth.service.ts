import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { lastValueFrom, timeout } from 'rxjs';
import { ExceptionService } from 'src/shared/exception.service';
import { SharedService } from 'src/shared/shared.service';
import { RESPONSE_MESSAGE } from 'utils/enums';
import {
  AccessTokenDto,
  AccountVerifyDto,
  ChangePasswordDto,
  RefreshTokenDto,
  UpdateAuthDto,
  VerifyForgetPasswordDto,
} from './dto';
import { EmailAddressDto } from './dto/email-address.dto';
import { GetUserByIdDto } from './dto/get-user-by-Id.dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE_TCP') private USER_SERVICE_TCP: ClientProxy,
    @Inject('USER_SERVICE_RMQ') private USER_SERVICE_RMQ: ClientProxy,

    @Inject('NOTIFICATION_SERVICE_RMQ')
    private NOTIFICATION_SERVICE_RMQ: ClientProxy,
    @Inject('NOTIFICATION_SERVICE_TCP')
    private NOTIFICATION_SERVICE_TCP: ClientProxy,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly exceptionService: ExceptionService,
    private readonly sharedService: SharedService,
  ) {}

  async users() {
    try {
      const users = await lastValueFrom(
        this.USER_SERVICE_TCP.send('get_all_user', {}).pipe(timeout(5000)),
      );

      if (users?.error) {
        return new RpcException(users?.error);
      }

      return users;
    } catch (error) {
      console.log({ error, function_name: this.users.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async userByEmail(emailAddressDto: EmailAddressDto) {
    try {
      const user = await lastValueFrom(
        this.USER_SERVICE_TCP.send('get_user_by_email', emailAddressDto).pipe(
          timeout(5000),
        ),
      );

      if (user?.error) {
        return new RpcException(user?.error);
      }

      return user;
    } catch (error) {
      console.log({ error, function_name: this.users.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async userById(getUserByIdDto: GetUserByIdDto) {
    try {
      const user = await lastValueFrom(
        this.USER_SERVICE_TCP.send('get_user_id', getUserByIdDto).pipe(
          timeout(5000),
        ),
      );

      if (user?.error) {
        return new RpcException(user?.error);
      }

      return user;
    } catch (error) {
      console.log({ error, function_name: this.userById.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async userSignup(signupUserDto: SignupUserDto) {
    try {
      const { email } = signupUserDto;

      // console.log(await this.cacheManager.get(email));

      const createUser = await lastValueFrom(
        this.USER_SERVICE_TCP.send('create_user', signupUserDto).pipe(
          timeout(5000),
        ),
      );

      // const createUser = await lastValueFrom(
      //   this.USER_SERVICE_RMQ.send('create_user', signupUserDto).pipe(timeout(5000)),
      // );

      if (createUser?.error) {
        return new RpcException(createUser?.error);
      }

      const generated_otp_code = await this.sharedService.generateOTP(email);

      const accountVerificationEmail = await lastValueFrom(
        this.NOTIFICATION_SERVICE_RMQ.send('sent_account_verification_mail', {
          email: email,
          otp_code: generated_otp_code,
        }).pipe(timeout(5000)),
      );

      if (accountVerificationEmail?.error) {
        return new RpcException(accountVerificationEmail?.error);
      }

      return {
        statusCode: 200,
        message: 'User Created Successfull. Place chack you email.',
      };
    } catch (error) {
      console.log({ error, function_name: this.userSignup.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async userAccoutVerify(accountVerifyDto: AccountVerifyDto) {
    try {
      const { email, otp } = accountVerifyDto;

      // const getOtp = await this.sharedService.getOTPCode(email);
      // console.log({ getOtp });

      const isVerified = await this.sharedService.verifyOTPCode(email, otp);

      if (!isVerified) {
        return new RpcException('Invalid email or otp code!');
      }

      const updateUser = await lastValueFrom(
        this.USER_SERVICE_TCP.send('update_user_account', {
          email,
          account_status: 'ACTIVE',
          email_verified: true,
        }).pipe(timeout(5000)),
      );

      if (updateUser?.error) {
        return new RpcException(updateUser?.error);
      }

      return {
        statusCode: 200,
        message: 'User account verify ',
      };
    } catch (error) {
      console.log({ error, function_name: this.userAccoutVerify.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async userSignin(signinUserDto: SigninUserDto) {
    try {
      const { email } = signinUserDto;

      // chack email and password valid or not
      const loggedInUser = await lastValueFrom(
        this.USER_SERVICE_TCP.send('login_user', signinUserDto).pipe(
          timeout(5000),
        ),
      );

      if (loggedInUser?.error) {
        return new RpcException(loggedInUser?.error);
      }

      // when user not verified
      if (!loggedInUser?.email_verified) {
        const generated_otp_code = await this.sharedService.generateOTP(email);

        const accountVerificationEmail = await lastValueFrom(
          this.NOTIFICATION_SERVICE_RMQ.send('sent_account_verification_mail', {
            email: email,
            otp_code: generated_otp_code,
          }).pipe(timeout(5000)),
        );

        if (accountVerificationEmail?.error) {
          return new RpcException(accountVerificationEmail?.error);
        }

        return {
          statusCode: 200,
          message: 'Account verification OTP sended. Place chack you email.',
        };
      }

      // sign token and send respose

      const payload = {
        id: loggedInUser?._id,
      };

      const accessToken = await this.sharedService.signAccessToken(payload);
      const refreshToken = await this.sharedService.signRefreshToken(
        loggedInUser?._id,
        payload,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.log({ error, function_name: this.userSignin.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    try {
      const updated_user = await lastValueFrom(
        this.USER_SERVICE_TCP.send('change_password', changePasswordDto).pipe(
          timeout(5000),
        ),
      );

      return updated_user;
    } catch (error) {
      console.log({ error, function_name: this.changePassword.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async forgetPassword(emailAddressDto: EmailAddressDto) {
    try {
      const { email } = emailAddressDto;
      const unic_email = email + email;

      const generated_otp_code =
        await this.sharedService.generateOTP(unic_email);

      const accountVerificationEmail = await lastValueFrom(
        this.NOTIFICATION_SERVICE_RMQ.send('sent_reset_password_mail', {
          email: email,
          otp_code: generated_otp_code,
        }).pipe(timeout(5000)),
      );

      if (accountVerificationEmail?.error) {
        return new RpcException(accountVerificationEmail?.error);
      }

      return {
        statusCode: 200,
        message: 'Password reset OTP sented. Place chack you email.',
      };
    } catch (error) {
      console.log({ error, function_name: this.forgetPassword.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async changeForgetedPassword(
    verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    try {
      const { email, otp, new_password } = verifyForgetPasswordDto;

      const unic_email = email + email;

      const getOtp = await this.sharedService.getOTPCode(unic_email);
      console.log({ getOtp });

      const isVerified = await this.sharedService.verifyOTPCode(
        unic_email,
        otp,
      );

      if (!isVerified) {
        return new RpcException('Invalid email or otp code!');
      }

      // change_forgeted_password

      const updateUser = await lastValueFrom(
        this.USER_SERVICE_TCP.send('change_forgeted_password', {
          email,
          password: new_password,
        }).pipe(timeout(5000)),
      );

      if (updateUser?.error) {
        return new RpcException(updateUser?.error);
      }

      return {
        statusCode: 200,
        message: 'Password change successfull ',
      };
    } catch (error) {
      console.log({ error, function_name: this.changeForgetedPassword.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async update(updateAuthDto: UpdateAuthDto) {
    try {
      return await lastValueFrom(
        this.USER_SERVICE_TCP.send('update_user_info', updateAuthDto).pipe(
          timeout(5000),
        ),
      );
    } catch (error) {
      console.log({ error, function_name: this.update.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async delete(getUserByIdDto: GetUserByIdDto) {
    try {
      return await lastValueFrom(
        this.USER_SERVICE_TCP.send('delete_user_by_id', getUserByIdDto).pipe(
          timeout(5000),
        ),
      );
    } catch (error) {
      console.log({ error, function_name: this.delete.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async accessTokenVerification(accessTokenDto: AccessTokenDto) {
    try {
      const { access_token } = accessTokenDto;
      const isVerified = this.sharedService.accessTokenVerify(access_token);
      return {
        authenticated: isVerified,
      };
    } catch (error) {
      console.log({ error, function_name: this.accessTokenVerification.name });

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refresh_token } = refreshTokenDto;

      const { id } = await this.sharedService.decodeRefreshToken(refresh_token);

      const verifyToken = await this.sharedService.refreshTokenVerify(
        id,
        refresh_token,
      );

      if (!verifyToken) {
        return new RpcException(RESPONSE_MESSAGE.INVALID_JWT_TOKEN);
      }

      // sign token and send respose

      const payload = {
        id,
      };

      const accessToken = await this.sharedService.signAccessToken(payload);
      const refreshToken = await this.sharedService.signRefreshToken(
        id,
        payload,
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.log({ error, function_name: this.refreshToken.name });

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async logout(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refresh_token } = refreshTokenDto;

      const { id } = await this.sharedService.decodeRefreshToken(refresh_token);

      const verifyToken = await this.sharedService.refreshTokenVerify(
        id,
        refresh_token,
      );

      if (!verifyToken) {
        return new RpcException(RESPONSE_MESSAGE.INVALID_JWT_TOKEN);
      }

      const detetedToken = await this.sharedService.deleteRefreshToken(id);
      if (!detetedToken) {
        return new RpcException(RESPONSE_MESSAGE.INVALID_JWT_TOKEN);
      }

      return {
        statusCode: 200,
        message: 'Logout successfull',
      };
    } catch (error) {
      console.log({ error, function_name: this.logout.name });

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }
}
