import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import {
  AccountVerifyDto,
  ChangePasswordDto,
  CreateAuthDto,
  EmailAddressDto,
  GetUserByIdDto,
  LoginAuthDto,
  UpdateAuthDto,
  VerifyForgetPasswordDto,
} from './dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE_TCP') private readonly AUTH_SERVICE_TCP: ClientProxy,
    @Inject('AUTH_SERVICE_RMQ') private readonly AUTH_SERVICE_RMQ: ClientProxy,
  ) {}

  async Users() {
    try {
      const users = await lastValueFrom(
        this.AUTH_SERVICE_TCP.send('get_all_users', {}).pipe(timeout(5000)),
      );
      if (users?.current) {
        return users?.current;
      }
      return users;
    } catch (error) {
      console.log({ error, function_name: this.Users.name });

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
      const users = await lastValueFrom(
        this.AUTH_SERVICE_TCP.send('get_user_by_email', emailAddressDto).pipe(
          timeout(5000),
        ),
      );

      return users;
    } catch (error) {
      console.log({ error, function_name: this.userByEmail.name });

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
      const users = await lastValueFrom(
        this.AUTH_SERVICE_TCP.send('get_user_by_id', getUserByIdDto).pipe(
          timeout(5000),
        ),
      );

      return users;
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

  async signup(createAuthDto: CreateAuthDto) {
    try {
      const user_created = await lastValueFrom(
        this.AUTH_SERVICE_TCP.send('signup_user', createAuthDto).pipe(
          timeout(5000),
        ),
      );

      // const user_created = await lastValueFrom(
      //   this.AUTH_SERVICE_RMQ.send('signup_user', createAuthDto).pipe(timeout(5000)),
      // );

      return user_created;
    } catch (error) {
      console.log({ error, function_name: this.signup.name });

      if (error?.code === 'ECONNREFUSED') {
        return new RpcException('Internal Server Error!');
      }

      if (error?.message) {
        return new RpcException(error?.message);
      }
      return new RpcException(error);
    }
  }

  async accountOTPVerification(accountVerifyDto: AccountVerifyDto) {
    try {
      const { email, otp } = accountVerifyDto;
      const verified = await lastValueFrom(
        this.AUTH_SERVICE_TCP.send('user_account_verify_by_otp', {
          email,
          otp,
        }).pipe(timeout(5000)),
      );
      return verified;
    } catch (error) {
      throw error;
    }
  }

  async signin(loginAuthDto: LoginAuthDto) {
    try {
      return this.AUTH_SERVICE_TCP.send('signin_user', loginAuthDto).pipe(
        timeout(5000),
      );
    } catch (error) {
      throw error;
    }
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    try {
      return this.AUTH_SERVICE_TCP.send(
        'change_user_password',
        changePasswordDto,
      ).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }

  async forgetPassword(emailAddressDto: EmailAddressDto) {
    try {
      return this.AUTH_SERVICE_TCP.send(
        'forget_user_password',
        emailAddressDto,
      ).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }

  async verifyforgetPasswordAndSave(
    verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    try {
      return this.AUTH_SERVICE_TCP.send(
        'verify_forgeted_user_password',
        verifyForgetPasswordDto,
      ).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }

  async update(updateAuthDto: UpdateAuthDto) {
    try {
      return this.AUTH_SERVICE_TCP.send(
        'update_user_account',
        updateAuthDto,
      ).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }

  async delete(getUserById: GetUserByIdDto) {
    try {
      return this.AUTH_SERVICE_TCP.send(
        'delete_user_account',
        getUserById,
      ).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refresh_token } = refreshTokenDto;

      return this.AUTH_SERVICE_TCP.send('refresh_token', {
        refresh_token,
      }).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }

  async logoutUser(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refresh_token } = refreshTokenDto;

      return this.AUTH_SERVICE_TCP.send('logout', {
        refresh_token,
      }).pipe(timeout(5000));
    } catch (error) {
      throw error;
    }
  }
}
