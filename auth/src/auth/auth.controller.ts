import { Body, Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import {
  AccessTokenDto,
  AccountVerifyDto,
  ChangePasswordDto,
  EmailAddressDto,
  GetUserByIdDto,
  RefreshTokenDto,
  UpdateAuthDto,
  VerifyForgetPasswordDto,
} from './dto';
import { SigninUserDto } from './dto/signin-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @EventPattern('get_all_users')
  async getAllUsers() {
    return await this.authService.users();
  }

  @EventPattern('get_user_by_email')
  async getUserByEmail(@Body() emailAddressDto: EmailAddressDto) {
    return await this.authService.userByEmail(emailAddressDto);
  }

  @EventPattern('get_user_by_id')
  async getUserById(@Body() getUserByIdDto: GetUserByIdDto) {
    return await this.authService.userById(getUserByIdDto);
  }

  @EventPattern('signup_user')
  async signup(@Body() signupUserDto: SignupUserDto) {
    return await this.authService.userSignup(signupUserDto);
  }

  @EventPattern('user_account_verify_by_otp')
  async verifyUserAccount(@Body() accountVerifyDto: AccountVerifyDto) {
    return await this.authService.userAccoutVerify(accountVerifyDto);
  }

  @EventPattern('signin_user')
  async signin(@Body() signinUserDto: SigninUserDto) {
    return await this.authService.userSignin(signinUserDto);
  }

  @EventPattern('change_user_password')
  async changeUserPassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(changePasswordDto);
  }

  @EventPattern('forget_user_password')
  async forgetPassword(@Body() emailAddressDto: EmailAddressDto) {
    return await this.authService.forgetPassword(emailAddressDto);
  }

  @EventPattern('verify_forgeted_user_password')
  async changeForgetedPassword(
    @Body() verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    return await this.authService.changeForgetedPassword(
      verifyForgetPasswordDto,
    );
  }

  @EventPattern('update_user_account')
  async updateUserAccount(@Body() updateAuthDto: UpdateAuthDto) {
    return await this.authService.update(updateAuthDto);
  }

  @EventPattern('delete_user_account')
  async deleteUserAccount(@Body() getUserByIdDto: GetUserByIdDto) {
    return await this.authService.delete(getUserByIdDto);
  }

  @EventPattern('verify_access_token')
  async verifyAccessToken(@Body() accessTokenDto: AccessTokenDto) {
    return await this.authService.accessTokenVerification(accessTokenDto);
  }

  @EventPattern('refresh_token')
  async refreshedToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @EventPattern('logout')
  async logoutUser(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.logout(refreshTokenDto);
  }
}
