import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  EmailAddressDto,
  GetUserByIdDto,
  RefreshTokenDto,
  UpdateAuthDto,
  VerifyForgetPasswordDto,
} from './dto';
import { AccountVerifyDto } from './dto/account-verify.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // get all users
  @Get('all/users')
  @UseGuards(AccessTokenGuard)
  async getAllUsers() {
    return await this.authService.Users();
  }
  // get user by email address
  @Get('get/user/by/email/:email')
  async getUserByEmail(@Param() emailAddressDto: EmailAddressDto) {
    return await this.authService.userByEmail(emailAddressDto);
  }

  // get user by user_id
  @Get('get/user/by/id/:id')
  async getUserById(@Param() getUserByIdDto: GetUserByIdDto) {
    return await this.authService.userById(getUserByIdDto);
  }

  // register new user
  @Post('signup')
  async signUpUser(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.signup(createAuthDto);
  }

  // verify user account
  @Post('account/otp/verify')
  @HttpCode(200)
  async accountOTPVerify(@Body() accountVerifyDto: AccountVerifyDto) {
    return await this.authService.accountOTPVerification(accountVerifyDto);
  }

  // login in user
  @Post('signin')
  @HttpCode(200)
  async signInUser(@Body() loginAuthDto: LoginAuthDto) {
    return await this.authService.signin(loginAuthDto);
  }

  // change user password
  @Post('change/password')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  async changeUserPassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(changePasswordDto);
  }

  // rest forgeted password
  @Post('forget/password')
  @HttpCode(200)
  async forgetUserPassword(@Body() emailAddressDto: EmailAddressDto) {
    return await this.authService.forgetPassword(emailAddressDto);
  }

  // verify forgeted password
  @Post('verify/forgeted/password')
  @HttpCode(200)
  async verifyForgetPassword(
    @Body() verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    return await this.authService.verifyforgetPasswordAndSave(
      verifyForgetPasswordDto,
    );
  }

  // update user all info
  @Patch('update/:id')
  @UseGuards(AccessTokenGuard)
  async updateUser(
    @Param() getUserByIdDto: GetUserByIdDto,
    @Body() updateAuthDto: UpdateAuthDto,
  ) {
    const { id } = getUserByIdDto;

    const user_info = {
      user_id: id,
      ...updateAuthDto,
    };
    return await this.authService.update(user_info);
  }

  // delete user account
  @Delete('delete/:id')
  @UseGuards(AccessTokenGuard)
  async deleteUser(@Param() getUserByIdDto: GetUserByIdDto) {
    return await this.authService.delete(getUserByIdDto);
  }

  // delete user account
  @Post('refresh/token')
  async tokenRefresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  // delete user account
  @Post('logout')
  @HttpCode(200)
  @UseGuards(AccessTokenGuard)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.logoutUser(refreshTokenDto);
  }
}
